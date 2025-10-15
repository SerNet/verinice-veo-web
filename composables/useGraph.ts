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
import { useTheme } from 'vuetify';

type ForceGraphInstance = {
  graphData: (data: { nodes: any[]; links: any[] }) => void;
  zoomToFit: (ms?: number, padding?: number) => void;
  width: (w: number) => ForceGraphInstance;
  height: (h: number) => ForceGraphInstance;
  maxZoom: (zoom: number) => ForceGraphInstance;
};

type GraphNode = IGraphNode & {
  x: number;
  y: number;
  __bckgDimensions?: [number, number];
};

type GraphLink = {
  source: string | { id: string };
  target: string | { id: string };
  label?: string;
  curvature?: number;
  __src?: string;
  __tgt?: string;
};

type GraphLinkRuntime = GraphLink & {
  source: { x: number; y: number };
  target: { x: number; y: number };
};

export function useGraph(
  graphContainerRef: Ref<HTMLElement | null>,
  graphData: Ref<IGraphResult | undefined>,
  isLoading: Ref<boolean>
) {
  let forceGraph: ForceGraphInstance;
  let ro: ResizeObserver | null = null;

  const route = useRoute();
  const router = useRouter();
  const theme = useTheme();

  const getStyles = () => getComputedStyle(graphContainerRef.value || document.documentElement);
  const fontFamily = getStyles().getPropertyValue('--graph-font-family').trim();
  const baseFont = parseFloat(getStyles().getPropertyValue('--graph-node-font-size'));
  // Duration (in milliseconds) of the zoom-to-fit animation applied after graph rendering
  const ZOOM_FIT_ANIMATION_MS = 800;
  // Maximum number of characters shown in node labels before truncation
  const NODE_LABEL_MAX_LENGTH = 20;
  // Base font size is divided by this value to compute node label font size
  const NODE_FONT_RATIO = 6;
  // Line height multiplier for multi-line node labels
  const NODE_LINE_HEIGHT_RATIO = 1.4;
  // Padding multiplier applied around node text to compute the node background box size
  const NODE_BOX_PADDING_RATIO = 1.5;
  // Vertical spacing factor between lines in multi-line node labels
  const NODE_TEXT_VERTICAL_SPACING = 1.2;
  // Corner radius for rounded node background rectangles
  const NODE_CORNER_RADIUS = 4;
  // Maximum number of characters shown in link labels before truncation
  const LINK_LABEL_MAX_LENGTH = 30;
  // Padding around link label text background box
  const LINK_LABEL_PADDING = 1.2;
  // Line height used when rendering multi-line link labels
  const LINK_LINE_HEIGHT = 2.4;
  // Factor used to compute label offset from the link center based on link curvature
  const CURVE_HEIGHT_FACTOR = 0.5;
  // Length of directional arrows rendered on links
  const ARROW_LENGTH = 3;
  // Relative position (0–1) along the link path where the directional arrow is rendered
  const ARROW_RELATIVE_POSITION = 0.9;
  // Padding for zoomToFit
  const PADDING = 80;

  // Apply curvature to separate parallel  links
  function computeLinkCurvatures(links: GraphLink[]): GraphLink[] {
    const selfLoopLinks: Record<string, GraphLink[]> = {};
    const sameNodeLinks: Record<string, GraphLink[]> = {};

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

  // Refit graph when container size changes
  const handleResize = () => {
    if (!forceGraph || !graphContainerRef.value) return;
    const w = graphContainerRef.value.clientWidth;
    const h = graphContainerRef.value.clientHeight;
    forceGraph.width(w).height(h);

    forceGraph.zoomToFit(ZOOM_FIT_ANIMATION_MS, PADDING);
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

  const applyGraphThemeClass = () => {
    if (!graphContainerRef.value) return;

    const isDark = theme.global.name.value === 'dark';
    graphContainerRef.value.classList.toggle('layer-dark', isDark);
    graphContainerRef.value.classList.toggle('layer-light', !isDark);
  };

  // Custom canvas renderer for graph nodes
  const drawNode = (node: GraphNode, ctx: CanvasRenderingContext2D) => {
    const label = node.displayName;
    const short = label.length > NODE_LABEL_MAX_LENGTH ? label.slice(0, NODE_LABEL_MAX_LENGTH) + '…' : label;
    const parts = short.split(' ');

    const font = baseFont / NODE_FONT_RATIO;
    ctx.font = `${font}px ${fontFamily}`;

    const textW = Math.max(...parts.map((p: string) => ctx.measureText(p).width));
    const textH = parts.length * (font * NODE_LINE_HEIGHT_RATIO);
    const boxW = textW + font * NODE_BOX_PADDING_RATIO;
    const boxH = textH + font * NODE_BOX_PADDING_RATIO;

    ctx.fillStyle =
      getStyles().getPropertyValue(`--node-color-${node.elementType}`).trim() ||
      getStyles().getPropertyValue('--node-color-default').trim();

    ctx.beginPath();
    ctx.roundRect(node.x - boxW / 2, node.y - boxH / 2, boxW, boxH, NODE_CORNER_RADIUS);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = getStyles().getPropertyValue('--graph-node-text-color').trim();

    parts.forEach((p: string, i: number) => {
      ctx.fillText(p, node.x, node.y + (i - (parts.length - 1) / 2) * (font * NODE_TEXT_VERTICAL_SPACING));
    });

    node.__bckgDimensions = [boxW, boxH];
  };

  // Render link labels along the link direction
  const drawLinkLabel = (link: GraphLinkRuntime, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;

    if (typeof start !== 'object' || typeof end !== 'object') return;
    if (!link.label) return;

    const isDark = theme.global.name.value === 'dark';

    const styles = getStyles();
    const bg =
      styles.getPropertyValue('--graph-link-bg')?.trim() ||
      (isDark ? 'rgba(28, 28, 28, 0.75)' : 'rgba(255, 255, 255, 0.8)');
    const textColor = styles.getPropertyValue('--graph-link-text-color')?.trim() || (isDark ? '#e0e0e0' : '#595959');

    const short =
      link.label.length > LINK_LABEL_MAX_LENGTH ? link.label.slice(0, LINK_LABEL_MAX_LENGTH) + '…' : link.label;
    const lines = short.split(/(?<=\/)|\s+/).filter(Boolean);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (!dist) return;

    const midX = start.x + dx / 2;
    const midY = start.y + dy / 2;

    const nx = -dy / dist;
    const ny = dx / dist;

    const curvature = link.curvature || 0;
    const curveHeight = curvature * dist * CURVE_HEIGHT_FACTOR;

    const textX = midX + nx * curveHeight;
    const textY = midY + ny * curveHeight;

    let textAngle = Math.atan2(dy, dx);
    if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
    if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

    ctx.save();
    ctx.font = `2px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const textHeight = lines.length * LINK_LINE_HEIGHT;

    const boxW = textWidth + LINK_LABEL_PADDING * 2;
    const boxH = textHeight + LINK_LABEL_PADDING * 2;

    ctx.translate(textX, textY);
    ctx.rotate(textAngle);

    ctx.fillStyle = bg;
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

    ctx.fillStyle = textColor;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * LINK_LINE_HEIGHT);
    });

    ctx.restore();
  };

  // Initialize and configure the ForceGraph instance
  const initGraph = (container: HTMLElement) => {
    try {
      if (forceGraph) {
        cleanup();
      }
      const ForceGraphAny = ForceGraph as unknown as () => any;
      const graph = ForceGraphAny()(container);

      graph
        .maxZoom(8)
        .nodeLabel((n: IGraphNode) => n.displayName)
        .nodeCanvasObject(drawNode)
        .nodePointerAreaPaint((node, color, ctx) => {
          const bckgDimensions = node.__bckgDimensions;
          if (!bckgDimensions) return;
          ctx.fillStyle = color;
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        })
        .linkCanvasObjectMode(() => 'after')
        .linkCanvasObject(drawLinkLabel)
        .linkCurvature('curvature')
        .linkDirectionalArrowLength(ARROW_LENGTH)
        .linkDirectionalArrowRelPos(ARROW_RELATIVE_POSITION)
        .linkColor(() => getStyles().getPropertyValue('--graph-link-color').trim())
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
    } catch (error) {
      console.error('Graph Failed', error);
    }
  };

  // Apply new graph data and update the rendered graph
  const renderGraph = (newData: IGraphResult) => {
    if (!forceGraph || !newData?.nodes || !newData?.links) return;

    const nodes = toRaw(newData.nodes);
    const links = toRaw(newData.links);

    forceGraph.graphData({
      nodes,
      links: computeLinkCurvatures(links)
    });

    setTimeout(() => {
      forceGraph.zoomToFit(ZOOM_FIT_ANIMATION_MS, PADDING);
    }, 700);

    isLoading.value = false;
  };

  // Clean up graph instance and related observers to avoid memory leaks
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
      applyGraphThemeClass();
    }
  });

  // Re-render graph when navigation target, data or container reference changes
  watch(
    [() => route.params.object, () => graphData.value, () => graphContainerRef.value],
    async () => {
      if (!graphContainerRef.value) return;
      if (!graphData.value?.nodes) return;
      await nextTick();

      renderGraph(graphData.value);
      setupResizeObserver();
      applyGraphThemeClass();
    },
    { immediate: true }
  );

  // Update graph styles when theme changes (light/dark mode)
  watch(
    () => theme.global.name.value,
    async () => {
      if (!forceGraph) return;

      applyGraphThemeClass();
    }
  );

  onUnmounted(() => {
    cleanup();
  });

  return {
    destroy: cleanup
  };
}
