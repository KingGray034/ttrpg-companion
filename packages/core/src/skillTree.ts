// ---- Types ----

export type TaggedNode = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  prerequisites: string[];
  cost: number;
};

export type ArchetypeThresholds = Record<string, number>;

export type OppositionRules = Record<string, string[]>;

export type NodeColor = "green" | "red" | "blue" | "white" | "gold" | "purple";

export type NodeShape = "circle" | "triangle" | "square" | "diamond" | "star" | "hexagon";

export type NodeVisual = {
  nodeId: string;
  color: NodeColor;
  shape: NodeShape;
};

// ---- Pipeline ----

export function countTags(nodes: TaggedNode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const node of nodes) {
    for (const tag of node.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

export function detectActiveArchetypes(
  tagCounts: Record<string, number>,
  thresholds: ArchetypeThresholds
): string[] {
  return Object.entries(thresholds)
    .filter(([tag, threshold]) => (tagCounts[tag] ?? 0) >= threshold)
    .map(([tag]) => tag);
}

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