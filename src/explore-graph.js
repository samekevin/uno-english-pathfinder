export function createExploreGraph(data){
  const nodes=(data.nodes||[]).filter(n=>n && n.active!==false);
  const byId=new Map(nodes.map(n=>[n.id,n]));
  const adjacency=new Map(nodes.map(n=>[n.id,[]]));
  for(const edge of (data.edges||[])){
    if(!byId.has(edge.source)||!byId.has(edge.target)) continue;
    adjacency.get(edge.source).push({...edge,otherId:edge.target});
    adjacency.get(edge.target).push({...edge,otherId:edge.source});
  }
  const topicsByNode=new Map();
  for(const node of nodes){
    if(node.type==='topic') topicsByNode.set(node.id,node);
  }
  const facultyToFaculty=new Map();
  for(const node of nodes.filter(n=>n.type==='faculty')){
    const related=new Map();
    for(const e of adjacency.get(node.id)||[]){
      if(topicsByNode.has(e.otherId)){
        for(const ee of adjacency.get(e.otherId)||[]){
          if(ee.otherId===node.id) continue;
          const other=byId.get(ee.otherId);
          if(other?.type==='faculty'){
            related.set(other.id,{node:other,via:topicsByNode.get(e.otherId),weight:(related.get(other.id)?.weight||0)+1});
          }
        }
      }
    }
    facultyToFaculty.set(node.id,[...related.values()].sort((a,b)=>b.weight-a.weight).slice(0,8));
  }
  function neighbors(id){ return (adjacency.get(id)||[]).map(e=>byId.get(e.otherId)).filter(Boolean); }
  function edgesFor(id){ return adjacency.get(id)||[]; }
  return {raw:data,nodes,byId,adjacency,neighbors,edgesFor,facultyToFaculty};
}
