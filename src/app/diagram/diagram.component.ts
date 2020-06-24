import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { ForceLink } from 'd3';
import { DiagramModel } from './diagram.model';
@Component({
  selector: 'app-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: ['diagram.component.css']
})
export class DiagramComponent implements OnInit {
  ngOnInit() {
    const svg = d3.select('svg');
    const width = parseFloat(svg.attr('width'));
    const height = parseFloat(svg.attr('height'));
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('charge', d3.forceManyBody().strength(-30))
    .force('collide', d3.forceCollide(10).strength(0.9))
    .force('link', d3.forceLink<any, any>().id(d => d.id));

    d3.json<DiagramModel>('../../assets/miserables.json').then((graph) => {
      console.log(graph);
      const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter().append('line')
      .attr('stroke-width', (d) =>  Math.sqrt(d.value) );
      const node = svg.append('g')
      .attr('class', 'nodes')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => color(d.group))
      .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

      console.log(node);

      node.append('title').text(d => d.id);
      simulation.nodes(graph.nodes).on('tick', ticked);
      simulation.force<ForceLink<any, any>>('link').links(graph.links);
      console.log(simulation);
      function ticked() {
        link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
        node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
      }
});
    function dragstarted(d) {
      if (!d3.event.active)
      {
        simulation.alphaTarget(0.7).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
      }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      }
    function dragended(d) {
      if (!d3.event.active)
      {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;

      }

  }
}
