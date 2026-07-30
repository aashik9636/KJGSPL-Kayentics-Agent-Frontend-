/**
 * Framework-Agnostic Stream Reducer for Brain Agent & Sub-Agent Streaming.
 *
 * Implements the exact wire contract & state merge rules:
 * - Map<step_id, StepNode> step tree in-place merging (no duplicate nodes)
 * - Absolute cumulative metrics merging (never sum, never replace wholesale)
 * - Mid-run & terminal artifact de-duplication by url
 * - Raw token concatenation (no inserted spaces)
 */

export function initStreamState() {
  return {
    nodes: {},               // Record<step_id, StepNode>
    rootOrder: [],           // string[] top-level step_ids in first-seen order
    flatLines: [],           // string[] status messages without step_id
    answer: '',              // string concatenated raw Markdown answer
    metrics: {},             // Record<key, number> absolute cumulative totals snapshot
    done: false,             // boolean
    artifacts: [],           // Array<{ type: string, url: string, ... }>
    error: null,             // string | null
    confidence: null,        // number | null
    targetOrchestrators: [], // string[]
    inScope: true,
  };
}

export function applyChunk(state, chunk) {
  if (!chunk || !chunk.type) return state;

  switch (chunk.type) {
    case 'token': {
      // Concatenate raw — don't insert spaces, chunks are not whole words
      return {
        ...state,
        answer: state.answer + (chunk.content || ''),
      };
    }

    case 'status': {
      const meta = chunk.metadata;
      
      // Case A: Mid-run Artifact announcement without step_id
      if (meta && meta.artifact && typeof meta.artifact === 'object') {
        const newArt = meta.artifact;
        const exists = state.artifacts.some(a => a.url === newArt.url);
        const updatedArtifacts = exists ? state.artifacts : [...state.artifacts, newArt];
        
        return {
          ...state,
          artifacts: updatedArtifacts,
          flatLines: chunk.content ? [...state.flatLines, chunk.content] : state.flatLines,
        };
      }

      // Case B: Status message without step_id -> flat text line
      if (!meta || !meta.step_id) {
        if (!chunk.content) return state;
        return {
          ...state,
          flatLines: [...state.flatLines, chunk.content],
        };
      }

      // Case C: Step-tree node update with step_id
      const stepId = meta.step_id;
      const existingNode = state.nodes[stepId];

      const updatedNode = {
        step_id: stepId,
        parent: meta.parent !== undefined ? meta.parent : (existingNode?.parent ?? null),
        state: meta.state || existingNode?.state || 'running',
        kind: meta.kind || existingNode?.kind || 'tool',
        lane: meta.lane || existingNode?.lane,
        tool: meta.tool || existingNode?.tool,
        agent_label: meta.agent_label || existingNode?.agent_label || chunk.content || 'Agent Step',
        args: meta.args ? { ...(existingNode?.args || {}), ...meta.args } : existingNode?.args,
        summary: meta.summary !== undefined ? meta.summary : (existingNode?.summary ?? (meta.state === 'ok' || meta.state === 'error' ? chunk.content : null)),
        preview: meta.preview || existingNode?.preview,
        started_at: meta.started_at || existingNode?.started_at || Math.floor(Date.now() / 1000),
        step: meta.step || existingNode?.step,
        budget: meta.budget || existingNode?.budget,
      };

      const updatedNodes = {
        ...state.nodes,
        [stepId]: updatedNode,
      };

      // Maintain rootOrder for top-level nodes (parent === null) in first-seen order
      let updatedRootOrder = state.rootOrder;
      if (!updatedNode.parent && !state.rootOrder.includes(stepId)) {
        updatedRootOrder = [...state.rootOrder, stepId];
      }

      return {
        ...state,
        nodes: updatedNodes,
        rootOrder: updatedRootOrder,
      };
    }

    case 'metrics': {
      if (!chunk.metadata || typeof chunk.metadata !== 'object') return state;
      // Absolute cumulative totals — merge by key ({...prev, ...metadata}), never sum
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...chunk.metadata,
        },
      };
    }

    case 'done': {
      const meta = chunk.metadata || {};
      
      // De-duplicate done.metadata.artifacts by url
      const doneArtifacts = meta.artifacts || [];
      const mergedArtifacts = [...state.artifacts];
      doneArtifacts.forEach(art => {
        if (art && art.url && !mergedArtifacts.some(a => a.url === art.url)) {
          mergedArtifacts.push(art);
        }
      });

      return {
        ...state,
        done: true,
        confidence: meta.confidence !== undefined ? meta.confidence : state.confidence,
        targetOrchestrators: meta.target_orchestrators || state.targetOrchestrators,
        inScope: meta.in_scope !== undefined ? meta.in_scope : state.inScope,
        artifacts: mergedArtifacts,
      };
    }

    case 'error': {
      return {
        ...state,
        error: chunk.content || 'Pipeline failure',
      };
    }

    default:
      return state;
  }
}
