// ---- Types ----

export type TaggedNode = {
  id: string;
  tags: string[];
};

export type ArchetypeThresholds = Record<string, number>;

export type OppositionRules = Record<string, string[]>;

export type NodeColor = "green" | "red" | "blue" | "white" | "gold" | "purple";

// Accessibility: every color pairs with a distinct shape, never color alone.
export type NodeShape = "circle" | "triangle" | "square" | "diamond" | "star" | "hexagon";

export type NodeVisual = {
  nodeId: string;
  color: NodeColor;
  shape: NodeShape;
};

// Count tags across owned nodes ----

export function countTags(nodes: TaggedNode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const node of nodes) {
    for (const tag of node.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

// Which archetypes are active ----

export function detectActiveArchetypes(
  tagCounts: Record<string, number>,
  thresholds: ArchetypeThresholds
): string[] {
  return Object.entries(thresholds)
    .filter(([tag, threshold]) => (tagCounts[tag] ?? 0) >= threshold)
    .map(([tag]) => tag);
}

// Color + shape for a single node ----

function nodeOpposesActiveArchetype(
  node: TaggedNode,
  activeArchetypes: string[],
  oppositionRules: OppositionRules
): boolean {
  return activeArchetypes.some((archetype) => {
    const opposed = oppositionRules[archetype] ?? [];
    return node.tags.some((tag) => opposed.includes(tag));
  });
}

function nodeSharesActiveArchetype(node: TaggedNode, activeArchetypes: string[]): boolean {
  return node.tags.some((tag) => activeArchetypes.includes(tag));
}

export function colorForNode(
  node: TaggedNode,
  activeArchetypes: string[],
  oppositionRules: OppositionRules
): NodeVisual {
  if (nodeOpposesActiveArchetype(node, activeArchetypes, oppositionRules)) {
    return { nodeId: node.id, color: "red", shape: "triangle" };
  }
  if (nodeSharesActiveArchetype(node, activeArchetypes)) {
    return { nodeId: node.id, color: "green", shape: "circle" };
  }
  if (node.tags.length === 0) {
    return { nodeId: node.id, color: "white", shape: "square" };
  }
  return { nodeId: node.id, color: "blue", shape: "diamond" };
}

// ---- Orchestration: run the whole pipeline for a character ----

export function computeSkillTree(
  ownedNodes: TaggedNode[],
  allNodes: TaggedNode[],
  thresholds: ArchetypeThresholds,
  oppositionRules: OppositionRules
): NodeVisual[] {
  const tagCounts = countTags(ownedNodes);
  const activeArchetypes = detectActiveArchetypes(tagCounts, thresholds);
  return allNodes.map((node) => colorForNode(node, activeArchetypes, oppositionRules));
}