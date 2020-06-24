import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import { DiagramModel } from './diagram/diagram.model';

interface Node {
  name: string ;
  color: string;
  id: string | number;
  relation: string | number | boolean;
  type: string;
}

interface Link {
  source: string;
  target: string;
  relationship: string;
}

interface Graph {
  nodes: Node[];
  links: Link[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const svg = d3.select('svg').call(d3.zoom().on('zoom', () => {
      svg.attr('transform', d3.event.transform);
   }));
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('collide', d3.forceCollide(10).strength(0.9))
    .force('link', d3.forceLink<any, any>().id(d => d.name).distance(250));

    d3.json<DiagramModel>('assets/schema.json').then((data) => {
      const nodes: Node[] = [];
      const links: Link[] = [];

      data.nodes.forEach((d) => {
        nodes.push(d as Node);
      });

      data.links.forEach((d) => {
        links.push(d as Link);
      });
      const graph: Graph = { nodes, links } as Graph;

      let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data((d: any) => {
          const tempLinks = [];
          for (const templink of graph.links) {
            if (templink.relationship !== 'Attribute') {
              tempLinks.push(templink);
            }
          }
          return tempLinks;
        })
        .enter()
        .append('line')
        .attr('stroke-width', 8)
        .attr('stroke', (d) => {
          if (d.relationship === 'OneToOne') {
            return '#b0adac';
          }
          else if (d.relationship === 'ManyToMany') {
            return '#3c403d';
          }
          else if (d.relationship === 'Attribute') {
            return '#949494';
          }
        } )
        .attr('stroke-opacity', 0.6)
        ;


      let node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('rect')
        .data((d: any) => {
          const tempNodes = [];
          for (const tempnode of graph.nodes) {
            if (tempnode.type !== 'field') {
              tempNodes.push(tempnode);
            }
          }
          return tempNodes;
        })
        .enter()
        .append('rect')
        .attr('width', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 145;
        }).attr('height', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 60;
        })
        .attr('fill', (d) => d.color)
        .attr('rx', (d: any) => {
          if (d.relation) {
            return '0';
          }
          if (d.id) {
            return '40';
          }
          return 0;
        })
        ;
      const relationType = svg.append('g')
        .selectAll('rect')
        .data((d: any) => {
          const relations = [];
          for (const relation of graph.nodes) {
            if (relation.relation) {
              relations.push(relation);
            }
          }
          return relations;
        })
        .enter()
        .append('rect')
        .attr('class', 'relation_type')
        .attr('width', '10' )
        .attr('height', '10' )
        .attr('title', (d: any) => d.name)
        .attr('fill', '#182952')
        ;
      let relationTypeText;
      let joinTypeText;
      const circle = svg.append('g')
      .selectAll('circle')
      .data((d: any) => {
        const relations = [];
        for (const relation of graph.nodes) {
          if (relation.relation) {
            relations.push(relation);
          }
        }
        return relations;
      })
      .enter()
      .append('circle')
      .attr('class', 'join_keys')
      .attr('r', (d: any) => {
        if (d.relation) {
          return 5;
        }
        return 0;
      })
      .attr('title', (d: any) => d.name)
      .attr('fill', '#182952')
      ;
      const showRelation = d3.selectAll('.relation_type');
      showRelation.on('click', function() {
        if (d3.select(this).attr('fill') === '#182952') {
          d3.selectAll('.relation_type').attr('fill', '#182952').attr('width', 10).attr('height', 10);
          d3.selectAll('.relation_type_text').remove();
          const selectedRelation = d3.select(this).attr('title');
          d3.select(this).attr('fill', '#115173');
          d3.select(this).attr('stroke', 'black');
          d3.select(this).attr('stroke-width', '1');
          d3.select(this).attr('width', 13);
          d3.select(this).attr('height', 13);
          relationTypeText = svg.append('g')
      .attr('class', 'relation_type_text')
      .selectAll('text')
      .data((d: any) => {
        const tempNodes = [];
        for (const tempnode of graph.nodes) {
          if (tempnode.name === selectedRelation) {
            tempNodes.push(tempnode);
          }
        }
        return tempNodes;
      })
      .enter()
      .append('text')
      .text((d: any) => {
        const str =  d.name.split('-', 2);
        return str[0] + ' ---> ' + str[1];
      } );
          ticked();
        }
        else {
          d3.select(this).attr('fill', '#182952');
          d3.select(this).attr('width', 10);
          d3.select(this).attr('height', 10);
          d3.selectAll('.relation_type_text').remove();

        }
      });
      const showCircle = d3.selectAll('.join_keys');
      showCircle.on('click', function() {
        if (d3.select(this).attr('fill') === '#182952') {
          d3.selectAll('.join_keys').attr('fill', '#182952').attr('r', 5);
          const selectedRelation = d3.select(this).attr('title');
          const split = selectedRelation.split('-', 2);
          const tableAField = split[0] + '_' + 'field';
          const tableBField = split[1] + '_' + 'field';
          d3.select(this).attr('fill', '#115173');
          d3.select(this).attr('stroke', 'black');
          d3.select(this).attr('stroke-width', '1');
          d3.select(this).attr('r', 8);
          d3.selectAll('.links').remove();
          d3.selectAll('.nodes').remove();
          d3.selectAll('.texts').remove();
          d3.selectAll('.join_type_text').remove();
          joinTypeText = svg.append('g')
          .attr('class', 'join_type_text')
          .selectAll('text')
          .data((d: any) => {
            const tempNodes = [];
            for (const tempnode of graph.nodes) {
              if (tempnode.name === selectedRelation) {
                tempNodes.push(tempnode);
              }
            }
            return tempNodes;
          })
          .enter()
          .append('text')
          .text((d: any) => {
            return d.join_type;
          } );
          link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data((d: any) => {
          const tempLinks = [];
          for (const templink of graph.links) {
            if (templink.relationship !== 'Attribute') {
              tempLinks.push(templink);
            }
            else if (templink.target['name'].includes(tableAField) || templink.target['name'].includes(tableBField)) {
              tempLinks.push(templink);
            }
          }
          return tempLinks;
        })
        .enter()
        .append('line')
        .attr('stroke-width', (d) => {
          if (d.relationship === 'Attribute') {
            return 3;
          }
          return 8;
        })
        .attr('stroke', (d) => {
          if (d.relationship === 'OneToOne') {
            return '#b0adac';
          }
          else if (d.relationship === 'ManyToMany') {
            return '#3c403d';
          }
          else if (d.relationship === 'Attribute') {
            return '#949494';
          }
        } )
        .attr('stroke-opacity', 0.6)
        ;
          node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('rect')
        .data((d: any) => {
          const tempNodes = [];
          for (const tempnode of graph.nodes) {
            if (tempnode.type !== 'field') {
              tempNodes.push(tempnode);
            }
            else if (tempnode.name.includes(tableAField) || tempnode.name.includes(tableBField)) {
              tempNodes.push(tempnode);
            }
          }
          return tempNodes;
        })
        .enter()
        .append('rect')
        .attr('width', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 145;
        }).attr('height', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 60;
        })
        .attr('fill', (d) => d.color)
        .attr('rx', (d: any) => {
          if (d.relation) {
            return '0';
          }
          if (d.id) {
            return '40';
          }
          return 0;
        })
        ;
          texts = svg.append('g')
          .attr('class', 'texts')
      .selectAll('text')
      .data((d: any) => {
        const tempNodes = [];
        for (const tempnode of graph.nodes) {
          if (tempnode.type !== 'field') {
            tempNodes.push(tempnode);
          }
          else if (tempnode.name.includes(tableAField) || tempnode.name.includes(tableBField)) {
            tempNodes.push(tempnode);
          }
        }
        return tempNodes;
      })
      .enter()
      .append('text')
      .text((d: any) => {
        if (d.id) {
          return d.id;
        }
        return d.name;
      } );
          svg.selectAll('rect').call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    );
          link.append('title')
        .text((d) => d.relationship);

          simulation
        .nodes(graph.nodes as any)
        .on('tick', ticked);

          simulation.force<d3.ForceLink<any, any>>('link')
        .links(graph.links);
          ticked();
        }
        else {
          d3.select(this).attr('fill', '#182952');
          d3.select(this).attr('r', 5);
          d3.selectAll('.links').remove();
          d3.selectAll('.nodes').remove();
          d3.selectAll('.texts').remove();
          d3.selectAll('.join_type_text').remove();
          createSimulation();
          ticked();
        }
      });


      function createSimulation() {
        link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data((d: any) => {
          const tempLinks = [];
          for (const templink of graph.links) {
            if (templink.relationship !== 'Attribute') {
              tempLinks.push(templink);
            }
          }
          return tempLinks;
        })
        .enter()
        .append('line')
        .attr('stroke-width', 8)
        .attr('stroke', (d) => {
          if (d.relationship === 'OneToOne') {
            return '#b0adac';
          }
          else if (d.relationship === 'ManyToMany') {
            return '#3c403d';
          }
          else if (d.relationship === 'Attribute') {
            return '#949494';
          }
        } )
        .attr('stroke-opacity', 0.6)
        ;


        node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('rect')
        .data((d: any) => {
          const tempNodes = [];
          for (const tempnode of graph.nodes) {
            if (tempnode.type !== 'field') {
              tempNodes.push(tempnode);
            }
          }
          return tempNodes;
        })
        .enter()
        .append('rect')
        .attr('width', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 145;
        }).attr('height', (d: any) => {
          if (d.relation) {
            return 50;
          }
          return 60;
        })
        .attr('fill', (d) => d.color)
        .attr('rx', (d: any) => {
          if (d.relation) {
            return '0';
          }
          if (d.id) {
            return '40';
          }
          return 0;
        })
        ;
        texts = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data((d: any) => {
        const tempNodes = [];
        for (const tempnode of graph.nodes) {
          if (tempnode.type !== 'field') {
            tempNodes.push(tempnode);
          }
        }
        return tempNodes;
      })
      .enter()
      .append('text')
      .text((d: any) => {
        if (d.id) {
          return d.id;
        }
        return d.name;
      } );
        svg.selectAll('rect').call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );


        node.append('title')
        .text((d) => d.name);

        link.append('title')
        .text((d) => d.relationship);

        simulation
        .nodes(graph.nodes as any)
        .on('tick', ticked);

        simulation.force<d3.ForceLink<any, any>>('link')
        .links(graph.links);

      }
      let texts = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data((d: any) => {
        const tempNodes = [];
        for (const tempnode of graph.nodes) {
          if (tempnode.type !== 'field') {
            tempNodes.push(tempnode);
          }
        }
        return tempNodes;
      })
      .enter()
      .append('text')
      .text((d: any) => {
        if (d.id) {
          return d.id;
        }
        return d.name;
      } );
      svg.selectAll('rect').call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );


      node.append('title')
        .text((d) => d.name);

      link.append('title')
        .text((d) => d.relationship);

      simulation
        .nodes(graph.nodes as any)
        .on('tick', ticked);

      simulation.force<d3.ForceLink<any, any>>('link')
        .links(graph.links);

      function ticked() {
        if (joinTypeText) {
          joinTypeText
          .attr('x', (d: any) => {
            return d.x - 63;
        } )
        .attr('y', (d: any) => {
            return d.y - 18;
        } );
        }
        if (relationTypeText) {
          relationTypeText
        .attr('x', (d: any) => {
            return d.x + 53;
        } )
        .attr('y', (d: any) => {
            return d.y - 18;
        } );

        }
        circle
        .attr('cx', (d: any) => {
          return d.x - 1;
      } )
      .attr('cy', (d: any) => {
          return d.y - 21;
      } );
        relationType
        .attr('x', (d: any) => {
            return d.x + 35;
        } )
        .attr('y', (d: any) => {
            return d.y - 28;
        } );
        texts
        .attr('x', (d: any) => {
          if (d.relation) {
            return d.x + 40;
          }
          return d.x + 20;
        } )
        .attr('y', (d: any) => {
          if (d.relation) {
            return d.y + 40;
          }
          return d.y + 20;
        } );
  /*      label
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2 )
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 )
        ; */
        link
          .attr('x1', function(d: any) { return d.source.x; })
          .attr('y1', function(d: any) { return d.source.y; })
          .attr('x2', function(d: any) { return d.target.x; })
          .attr('y2', function(d: any) { return d.target.y; })
          ;
        node
          .attr('x', function(d: any) { return d.x - 13 ; })
          .attr('y', function(d: any) { return d.y - 13 ; })
          .attr('transform', (d: any) => {
            if (d.relation) {
              return 'rotate(45,' + (20 + d.x) + ',' + (20 + d.y) + ')';
            }
            return 'rotate(0,' + (20 + d.x) + ',' + (20 + d.y) + ')';
          });
      }
    });

    function dragstarted(d) {
      if (!d3.event.active) { simulation.alphaTarget(0.7).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) { simulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
  }
}
