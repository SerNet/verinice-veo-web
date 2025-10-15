/*
 * verinice.veo web
 * Copyright (C) 2025 sernet
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable no-console */
/*
 * verinice.veo web
 * Copyright (C) 2025 sernet
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import type { Ref } from 'vue';
import { nextTick, watch, onMounted, onUnmounted } from 'vue';
import ForceGraph from 'force-graph';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IGraphNode, IGraphResult } from './api/queryDefinitions/graph';
import { toRaw } from 'vue';

export function useGraph(
  graphContainerRef: Ref<HTMLElement | null>,
  graphData: Ref<IGraphResult | undefined>,
  isLoading: Ref<boolean>
) {
  let forceGraph: any = null;
  let ro: ResizeObserver | null = null;
  const styles = getComputedStyle(document.documentElement);

  const route = useRoute();
  const router = useRouter();

  function computeLinkCurvatures(links: any[]) {
    const selfLoopLinks: Record<string, any[]> = {};
    const sameNodeLinks: Record<string, any[]> = {};

    links.forEach((link) => {
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;

      link.__src = src;
      link.__tgt = tgt;

      const pairId = src <= tgt ? `${src}_${tgt}` : `${tgt}_${src}`;
      const map = src === tgt ? selfLoopLinks : sameNodeLinks;

      if (!map[pairId]) map[pairId] = [];
      map[pairId].push(link);
    });

    const curvatureMinMax = 0.25;
    for (const id in selfLoopLinks) {
      const links = selfLoopLinks[id];
      const last = links.length - 1;

      links[last].curvature = 1;
      const delta = (1 - curvatureMinMax) / last;

      for (let i = 0; i < last; i++) {
        links[i].curvature = curvatureMinMax + i * delta;
      }
    }

    for (const id in sameNodeLinks) {
      const group = sameNodeLinks[id];
      if (group.length <= 1) continue;

      const last = group.length - 1;

      group[last].curvature = curvatureMinMax;
      const delta = (2 * curvatureMinMax) / last;

      for (let i = 0; i < last; i++) {
        group[i].curvature = -curvatureMinMax + i * delta;

        if (group[last].__src !== group[i].__src) {
          group[i].curvature *= -1;
        }
      }
    }
    return links;
  }

  const handleResize = () => {
    if (!forceGraph || !graphContainerRef.value) return;
    const w = graphContainerRef.value.clientWidth;
    const h = graphContainerRef.value.clientHeight;
    forceGraph.width(w).height(h);
    forceGraph.zoomToFit(800, 60);
  };

  const setupResizeObserver = () => {
    if (!graphContainerRef.value || ro) return;

    ro = new ResizeObserver(() => handleResize());
    ro.observe(graphContainerRef.value);

    window.addEventListener('resize', handleResize);
  };

  const cleanupResizeObserver = () => {
    if (ro) {
      ro.disconnect();
      ro = null;
    }
    window.removeEventListener('resize', handleResize);
  };

  const initGraph = (container: HTMLElement) => {
    if (forceGraph) {
      cleanup();
    }
    const ForceGraphAny = ForceGraph as unknown as () => any;
    const graph = ForceGraphAny()(container);
    const baseFont = parseFloat(styles.getPropertyValue('--graph-node-font-size'));

    graph
      .nodeLabel((n: IGraphNode) => n.displayName)
      .nodeCanvasObject((node: any, ctx: any) => {
        const label = node.displayName;
        const short = label.length > 20 ? label.slice(0, 20) + '…' : label;
        const parts = short.split(' ');

        const font = baseFont / 6;
        ctx.font = `${font}px Sans-Serif`;

        const textW = Math.max(...parts.map((p: string) => ctx.measureText(p).width));
        const textH = parts.length * (font * 1.3);
        const boxW = textW + font * 1.5;
        const boxH = textH + font * 1.5;

        ctx.fillStyle =
          styles.getPropertyValue(`--node-color-${node.elementType}`).trim() ||
          styles.getPropertyValue('--node-color-default').trim();

        ctx.beginPath();
        ctx.roundRect(node.x - boxW / 2, node.y - boxH / 2, boxW, boxH, 4);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = styles.getPropertyValue('--graph-node-text-color').trim();

        parts.forEach((p: string, i: number) => {
          ctx.fillText(p, node.x, node.y + (i - (parts.length - 1) / 2) * (font * 1.2));
        });

        node.__bckgDimensions = [boxW, boxH];
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        const bckgDimensions = node.__bckgDimensions;
        if (!bckgDimensions) return;
        ctx.fillStyle = color;
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
      })
      .linkCanvasObjectMode(() => 'after')
      .linkCanvasObject((link, ctx) => {
        const start = link.source;
        const end = link.target;

        if (typeof start !== 'object' || typeof end !== 'object') return;

        const text = link.label;
        if (!text) return;

        const short = text.length > 30 ? text.slice(0, 30) + '…' : text;
        const lines = short.split(' ');

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return;

        const midX = start.x + dx / 2;
        const midY = start.y + dy / 2;

        const nx = -dy / dist;
        const ny = dx / dist;

        const curvature = link.curvature || 0;
        const curveHeight = curvature * dist * 0.5;

        const textX = midX + nx * curveHeight;
        const textY = midY + ny * curveHeight;

        let textAngle = Math.atan2(dy, dx);
        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

        ctx.font = '2px Sans-Serif';

        const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
        const lineHeight = 2.4;
        const textHeight = lines.length * lineHeight;
        const padding = 1.2;

        const boxW = textWidth + padding * 2;
        const boxH = textHeight + padding * 2;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle);

        ctx.fillStyle = styles.getPropertyValue('--graph-link-bg').trim();
        ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = styles.getPropertyValue('--graph-link-text-color').trim();

        lines.forEach((line, i) => {
          ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineHeight);
        });

        ctx.restore();
      })

      .linkDirectionalArrowLength(4)
      .linkDirectionalArrowRelPos((link) => {
        const t = link.target;
        const dims = t.__bckgDimensions;
        if (!dims) return 1;

        const dx = t.x - link.source.x;
        const dy = t.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.max(dims[0], dims[1]) / 2;

        const labelExtra = parseFloat(styles.getPropertyValue('--graph-node-font-size')) * 1.1;
        return (dist - offset + labelExtra) / dist;
      })
      .linkCurvature('curvature')
      .linkDirectionalArrowLength(4)
      .linkDirectionalArrowRelPos(0.9)
      .onNodeClick((node: IGraphNode) => {
        router.push({
          name: 'unit-domains-domain-objectType-subType-object',
          params: {
            unit: route.params.unit,
            domain: route.params.domain,
            objectType: VeoElementTypePlurals[node.elementType],
            subType: node.elementSubType,
            object: node.elementId
          },
          hash: '#graph'
        });
      });

    return graph;
  };

  const renderGraph = (newData: IGraphResult) => {
    if (!forceGraph || !newData?.nodes || !newData?.links) return;

    const nodes = toRaw(newData.nodes);
    const links = toRaw(newData.links);

    forceGraph.graphData({
      nodes,
      links: computeLinkCurvatures(links)
    });

    setTimeout(() => {
      forceGraph.zoomToFit(800, 60);
    }, 500);

    isLoading.value = false;
  };

  const cleanup = () => {
    cleanupResizeObserver();

    if (forceGraph) {
      try {
        forceGraph.graphData({ nodes: [], links: [] });
        if (graphContainerRef.value) {
          graphContainerRef.value.innerHTML = '';
        }
      } catch (error) {
        console.warn('Error during graph cleanup:', error);
      }
      forceGraph = null;
    }
  };

  onMounted(async () => {
    if (graphContainerRef.value) {
      forceGraph = initGraph(graphContainerRef.value);
    }
  });

  watch(
    [() => route.params.object, () => graphData.value, () => graphContainerRef.value],
    async () => {
      if (!graphContainerRef.value) return;
      if (!graphData.value?.nodes) return;
      await nextTick();

      renderGraph(graphData.value);
      setupResizeObserver();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    cleanup();
  });

  return {
    destroy: cleanup
  };
}
