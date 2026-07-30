/**
 * Stream State & Reducer for Brain Agent & Specialized Domain Sub-Agents.
 * Implements Claude-style Step Tree merging, cumulative metrics,
 * artifact de-duplication, and live token accumulation.
 */

export function initStreamState() {
  return {
    nodes: {}, // Map step_id -> StepNode
    rootOrder: [], // Array of top-level step_ids in first-seen order
    flatLines: [], // Log lines without step_id
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

      // Handle singular mid-run artifact announcement
      if (metadata?.artifact) {
        const art = metadata.artifact;
        if (art.url && !updatedArtifacts.some(a => a.url === art.url)) {
          updatedArtifacts = [...updatedArtifacts, art];
        }
      }

      // Step Tree Node Logic: Use explicit step_id/step or auto-derive key from content
      const rawContent = content || metadata?.summary || '';
      const stepId = metadata?.step_id || metadata?.step || (rawContent ? `step_auto_${rawContent.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : null);

      if (stepId) {
        const existingNode = updatedNodes[stepId];
        const nowSec = Math.floor(Date.now() / 1000);
        const parentId = metadata?.parent || existingNode?.parent || null;
        const kind = metadata?.kind || existingNode?.kind || 'step';
        const stateVal = metadata?.state || (content?.includes('Error') ? 'error' : 'running');

        const updatedNode = {
          id: stepId,
          parent: parentId,
          state: stateVal,
          kind: kind,
          lane: metadata?.lane || existingNode?.lane || null,
          tool: metadata?.tool || existingNode?.tool || null,
          agent_label: metadata?.agent_label || metadata?.label || existingNode?.agent_label || 'Agent Step',
          args: metadata?.args || existingNode?.args || null,
          summary: metadata?.summary || content || existingNode?.summary || null,
          preview: metadata?.preview || existingNode?.preview || null,
          started_at: existingNode?.started_at || metadata?.started_at || nowSec,
          budget: metadata?.budget || existingNode?.budget || null,
          children: existingNode?.children || [],
        };

        updatedNodes[stepId] = updatedNode;

        // Add to parent's children or rootOrder if new
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
        // Flat status line with no step_id
        updatedFlatLines = [...updatedFlatLines, content];
      }

      return {
        ...nextState,
        statusText: activeStatus,
        flatLines: updatedFlatLines,
        nodes: updatedNodes,
        rootOrder: updatedRootOrder,
        artifacts: updatedArtifacts,
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

    case 'done': {
      let finalArtifacts = [...nextState.artifacts];
      if (metadata?.artifacts && Array.isArray(metadata.artifacts)) {
        metadata.artifacts.forEach(art => {
          if (art?.url && !finalArtifacts.some(a => a.url === art.url)) {
            finalArtifacts.push(art);
          }
        });
      }

      return {
        ...nextState,
        isStreaming: false,
        statusText: '',
        done: true,
        confidence: metadata?.confidence ?? nextState.confidence ?? null,
        metadata: metadata || nextState.metadata,
        artifacts: finalArtifacts,
      };
    }

    case 'error': {
      return {
        ...nextState,
        isStreaming: false,
        statusText: '',
        error: content || 'Generation failed',
      };
    }

    case 'image_result': {
      let updatedArtifacts = nextState.artifacts;
      if (metadata?.image_url && !updatedArtifacts.some(a => a.url === metadata.image_url)) {
        updatedArtifacts = [
          ...updatedArtifacts,
          { type: 'image', url: metadata.image_url, ...metadata }
        ];
      }
      return {
        ...nextState,
        artifacts: updatedArtifacts,
      };
    }

    default:
      return nextState;
  }
}
