import type { TaggedNode, ArchetypeThresholds, OppositionRules, NodeVisual } from "./skillTree";
import { computeSkillTree } from "./skillTree";

export class Character {
  readonly id: string;
  readonly name: string;
  readonly worldId: string;
  private ownedNodeIds: string[];

  constructor(id: string, name: string, worldId: string, ownedNodeIds: string[] = []) {
    this.id = id;
    this.name = name;
    this.worldId = worldId;
    this.ownedNodeIds = ownedNodeIds;
  }

  ownsNode(nodeId: string): boolean {
    return this.ownedNodeIds.includes(nodeId);
  }

  learnNode(nodeId: string): void {
    if (!this.ownsNode(nodeId)) {
      this.ownedNodeIds.push(nodeId);
    }
  }

  getSkillTree(
    allNodes: TaggedNode[],
    thresholds: ArchetypeThresholds,
    oppositionRules: OppositionRules
  ): NodeVisual[] {
    const owned = allNodes.filter((node) => this.ownsNode(node.id));
    return computeSkillTree(owned, allNodes, thresholds, oppositionRules);
  }
}