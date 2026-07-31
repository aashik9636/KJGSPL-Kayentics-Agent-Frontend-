/**
 * Stream State & Reducer for Brain Agent & Specialized Domain Sub-Agents.
 * Implements Claude-style Step Tree merging, smart step filtering,
 * partial_result live table rows, lane progress tracking, cumulative metrics,
 * artifact de-duplication, and live Markdown token accumulation.
 */

function cleanLabel(rawContent, explicitLabel) {
  if (explicitLabel && explicitLabel !== 'Agent Step') return explicitLabel;
  if (!rawContent) return 'Agent Action';

  let label = rawContent
    .replace(/^(Activating|Running|Connecting to|Processing|Executing|Starting)\s+/i, '')
    .replace(/\.{2,}$/, '')
    .trim();

  if (/^still/i.test(label) || /searching/i.test(label) || /reading/i.test(label)) {
    return 'Web Research';
  }

  if (!label) return rawContent;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function initStreamState() {
  return {
    nodes: {}, // Map step_id -> StepNode
    rootOrder: [], // Array of top-level step_ids in first-seen order
    flatLines: [], // Log lines without step_id
    partialResults: [], // Live partial_result rows landed before done
    answer: '', // Live streaming markdown text
    statusText: '', // Current active status line
    isStreaming: false,
    isPendingBackground: false,
    error: null,
    metadata: null,
    metrics: {}, // Cumulative counters (key -> number)
    done: false,
    confidence: null,
    artifacts: [], // De-duplicated array of artifact objects { type, url, ... }
  };
}

export function applyChunk(state, chunk) {
  if (!chunk) return state;

  const nextState = { ...state };
  const { type, content, metadata } = chunk;

  switch (type) {
    case 'token': {
      return {
        ...nextState,
        statusText: '',
        answer: (nextState.answer || '') + (content || ''),
      };
    }

    case 'status': {
      const activeStatus = content || metadata?.summary || '';
      let updatedArtifacts = nextState.artifacts;
      let updatedFlatLines = nextState.flatLines;
      let updatedNodes = { ...nextState.nodes };
      let updatedRootOrder = [...nextState.rootOrder];

      if (metadata?.artifact) {
        const art = metadata.artifact;
        if (art.url && !updatedArtifacts.some(a => a.url === art.url)) {
          updatedArtifacts = [...updatedArtifacts, art];
        }
      }

      const rawContent = content || metadata?.summary || '';
      const explicitStepId = metadata?.step_id || metadata?.step || null;
      const isTransientLog = /^still/i.test(rawContent) || /reading \d+/i.test(rawContent) || /please wait/i.test(rawContent);

      let stepId = explicitStepId;
      if (!stepId && !isTransientLog && rawContent) {
        const toolOrAgent = metadata?.tool || metadata?.agent_label || metadata?.label;
        if (toolOrAgent) {
          stepId = `step_milestone_${toolOrAgent.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        } else {
          stepId = `step_action_${rawContent.split(/\s+/).slice(0, 3).join('_').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        }
      } else if (!stepId && isTransientLog) {
        const activeNodeId = updatedRootOrder.find(id => updatedNodes[id]?.state === 'running');
        if (activeNodeId) {
          updatedNodes[activeNodeId] = {
            ...updatedNodes[activeNodeId],
            summary: rawContent,
          };
        }
      }

      if (stepId) {
        const existingNode = updatedNodes[stepId];
        const nowSec = Math.floor(Date.now() / 1000);
        const parentId = metadata?.parent !== undefined ? metadata.parent : existingNode?.parent ?? null;
        const kind = metadata?.kind || existingNode?.kind || 'step';
        const stateVal = metadata?.state || (content?.includes('Error') ? 'error' : 'running');

        if (!existingNode) {
          Object.keys(updatedNodes).forEach(id => {
            if (updatedNodes[id].state === 'running') {
              updatedNodes[id] = {
                ...updatedNodes[id],
                state: 'ok',
              };
            }
          });
        }

        const derivedLabel = cleanLabel(rawContent, metadata?.agent_label || metadata?.label || metadata?.tool || existingNode?.agent_label);

        const updatedNode = {
          id: stepId,
          parent: parentId,
          state: stateVal,
          kind: kind,
          lane: metadata?.lane || existingNode?.lane || null,
          tool: metadata?.tool || existingNode?.tool || null,
          agent_label: derivedLabel,
          args: metadata?.args || existingNode?.args || null,
          summary: metadata?.summary || content || existingNode?.summary || null,
          preview: metadata?.preview || existingNode?.preview || null,
          started_at: existingNode?.started_at || metadata?.started_at || nowSec,
          children: existingNode?.children || [],
        };

        updatedNodes[stepId] = updatedNode;

        if (!existingNode) {
          if (parentId && updatedNodes[parentId]) {
            const pNode = updatedNodes[parentId];
            if (!pNode.children.includes(stepId)) {
              updatedNodes[parentId] = {
                ...pNode,
                children: [...pNode.children, stepId],
              };
            }
          } else if (!parentId && !updatedRootOrder.includes(stepId)) {
            updatedRootOrder.push(stepId);
          }
        }
      } else if (content) {
        updatedFlatLines = [...updatedFlatLines, content];
      }

      // Merge lane counts if present
      const laneMetrics = {};
      if (metadata?.lanes_total !== undefined) laneMetrics.lanes_total = metadata.lanes_total;
      if (metadata?.lanes_completed !== undefined) laneMetrics.lanes_completed = metadata.lanes_completed;
      if (metadata?.lanes_active !== undefined) laneMetrics.lanes_active = metadata.lanes_active;

      return {
        ...nextState,
        statusText: activeStatus,
        flatLines: updatedFlatLines,
        nodes: updatedNodes,
        rootOrder: updatedRootOrder,
        artifacts: updatedArtifacts,
        metrics: {
          ...nextState.metrics,
          ...laneMetrics,
        },
      };
    }

    case 'partial_result': {
      const newRow = metadata?.data || (metadata?.company ? { company: metadata.company, ...(metadata.data || {}) } : { result: content });
      const prevRows = nextState.partialResults || [];
      return {
        ...nextState,
        partialResults: [...prevRows, newRow],
      };
    }

    case 'metrics': {
      if (!metadata) return nextState;
      return {
        ...nextState,
        metrics: {
          ...nextState.metrics,
          ...metadata,
        },
      };
    }

    case 'image_result': {
      if (metadata?.image_generated && metadata?.image_url) {
        const art = {
          name: 'Generated Image',
          title: 'Generated Image',
          url: metadata.image_url,
          type: 'image',
        };
        const updatedArtifacts = [...nextState.artifacts];
        if (!updatedArtifacts.some(a => a.url === art.url)) {
          updatedArtifacts.push(art);
        }
        return {
          ...nextState,
          artifacts: updatedArtifacts,
        };
      }
      return nextState;
    }

    case 'done': {
      const meta = metadata || {};

      // 1. Extract artifacts from metadata (including single image_url)
      const doneArtifacts = Array.isArray(meta.artifacts) ? [...meta.artifacts] : [];
      if (meta.image_generated && meta.image_url) {
        doneArtifacts.push({
          name: 'Generated Image',
          title: 'Generated Image',
          url: meta.image_url,
          type: 'image',
        });
      }

      const mergedArtifacts = [...nextState.artifacts];
      doneArtifacts.forEach(art => {
        if (art && art.url && !mergedArtifacts.some(a => a.url === art.url)) {
          mergedArtifacts.push(art);
        }
      });

      // 2. Set answer fallback for agents that return final result in done.metadata
      const fallbackText = meta.response || meta.message || content || '';
      const imageMarkdown = (meta.image_generated && meta.image_url) ? `![Generated Image](${meta.image_url})\n\n${fallbackText}` : fallbackText;
      const finalAnswer = nextState.answer || imageMarkdown;

      const settledNodes = { ...nextState.nodes };
      Object.keys(settledNodes).forEach(id => {
        if (settledNodes[id].state === 'running' || settledNodes[id].state === 'pending') {
          settledNodes[id] = {
            ...settledNodes[id],
            state: 'ok',
          };
        }
      });

      return {
        ...nextState,
        answer: finalAnswer,
        nodes: settledNodes,
        isStreaming: false,
        statusText: '',
        done: true,
        confidence: meta.confidence !== undefined ? meta.confidence : nextState.confidence,
        targetOrchestrators: meta.target_orchestrators || nextState.targetOrchestrators,
        inScope: meta.in_scope !== undefined ? meta.in_scope : nextState.inScope,
        metadata: meta || nextState.metadata,
        artifacts: mergedArtifacts,
      };
    }

    case 'error': {
      const errorNodes = { ...nextState.nodes };
      Object.keys(errorNodes).forEach(id => {
        if (errorNodes[id].state === 'running') {
          errorNodes[id] = {
            ...errorNodes[id],
            state: 'error',
          };
        }
      });

      return {
        ...nextState,
        nodes: errorNodes,
        isStreaming: false,
        statusText: '',
        error: content || 'Generation failed',
      };
    }

    default:
      return nextState;
  }
}
