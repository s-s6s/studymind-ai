'use client'
import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node, Edge, Controls, Background,
  useNodesState, useEdgesState, BackgroundVariant,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
  level?: number
}

interface MindMapData {
  root: MindMapNode
  nodes?: MindMapNode[]
}

// Build React Flow nodes and edges from tree structure
function buildGraph(node: MindMapNode, parentId?: string, level = 0, index = 0, total = 1) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const angle = total > 1 ? (index / (total - 1)) * Math.PI * 2 : 0
  const radius = level * 200
  const x = level === 0 ? 400 : 400 + Math.cos(angle) * radius
  const y = level === 0 ? 300 : 300 + Math.sin(angle) * radius

  const colors = [
    '#6C63FF', '#7C3AED', '#2563EB', '#0891B2',
    '#059669', '#D97706', '#DC2626', '#DB2777'
  ]

  nodes.push({
    id: node.id,
    data: { label: node.label },
    position: { x, y },
    style: {
      background: level === 0 ? '#6C63FF' : colors[index % colors.length] + '22',
      border: `2px solid ${colors[index % colors.length]}`,
      borderRadius: level === 0 ? '12px' : '8px',
      color: '#F0F0FF',
      fontSize: level === 0 ? '14px' : '12px',
      fontWeight: level === 0 ? '700' : '500',
      padding: level === 0 ? '10px 16px' : '6px 12px',
      minWidth: level === 0 ? '120px' : '80px',
      textAlign: 'center',
    },
  })

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      style: { stroke: colors[index % colors.length], strokeWidth: level === 1 ? 2 : 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: colors[index % colors.length] },
    })
  }

  if (node.children?.length) {
    node.children.forEach((child, i) => {
      const { nodes: cn, edges: ce } = buildGraph(child, node.id, level + 1, i, node.children!.length)
      nodes.push(...cn)
      edges.push(...ce)
    })
  }

  return { nodes, edges }
}

export default function MindMapView({ data }: { data: MindMapData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    if (!data?.root) return
    const { nodes: n, edges: e } = buildGraph(data.root)
    setNodes(n)
    setEdges(e)
  }, [data])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#333360" gap={20} size={1} />
        <Controls
          style={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: '8px' }}
        />
      </ReactFlow>
    </div>
  )
}
