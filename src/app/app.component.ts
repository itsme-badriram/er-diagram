import { Component, OnInit, AfterContentChecked, ChangeDetectionStrategy } from '@angular/core';
import { Node, Edge, ClusterNode, Layout } from '@swimlane/ngx-graph';
import { nodes, clusters, links } from './data';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { D3ForceDirectedLayout } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  panelOpenState = false;
  name = 'NGX-Graph Demo';
  modals = [];
  relations = [];
  masterTable: string;
  slaveTable: string = null;
  masterKey = [];
  slaveKey = [];
  layout: Layout = new D3ForceDirectedLayout();
  nodes: Node[] = nodes;
  links: Edge[] = links;
  draggingEnabled: boolean = true;
  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;
  panOnZoom: boolean = true;
  autoZoom: boolean = false;
  autoCenter: boolean = false;
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();

  ngOnInit() {
    for (const node of nodes) {
      this.modals.push(node.id);
    }
    console.log(this.modals);
    this.layout.settings = {
      force: forceSimulation<any>().force('charge', forceManyBody().strength(-25)).force('collide', forceCollide(250).strength(0.5)),
      forceLink: forceLink<any, any>()
      .id(node => node.id)
      .distance(() => 500)
    };

  }
  setModal(event) {
    console.log(event);
    this.relations = [];
    this.masterKey = [];
    this.slaveKey = [];
    for (const link of links) {
      if (link.source === event) {
        this.masterTable = event;
        this.slaveTable = null;
        this.relations.push(link.target);
      }
      if (link.target === event) {
        this.slaveTable = event;
        this.masterTable = null;
        this.relations.push(link.source);
      }
    }
    const svg = d3.select('svg');
    const g = d3.select('g.nodes');
    const gg = d3.select('g.links');
    let zoom: any = d3.zoom()
    .extent([[0, 0], [1600, 900]])
    .scaleExtent([0, 8])
    .on('zoom', zoomed);
    function zoomed() {
      g.attr('transform', d3.event.transform);
      gg.attr('transform', d3.event.transform);
    }
    d3.selectAll('g.node-group')
    .each(function(d: any) {
      const temp = d3.select(this);
      const wrapperDiv = temp.select('.wrapperDiv');
      const title = wrapperDiv.select('.title');
      if (title.text() === event) {
        const transform = temp.attr('transform');
        const str = transform.split(',', 2);
        const xPos = str[0].split('(', 2)[1];
        const yPos = str[1].split(')', 2)[0];
        svg.transition()
      .duration(1000)
      .call(zoom.transform,
        d3.zoomIdentity
        .scale(1.7)
        .translate( -(xPos) , -(yPos)));

      }
      else {

      }
    });
  }
  setRelation(event) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    if (this.masterTable === null) {
      this.masterTable = event;
    }
    else {
      this.slaveTable = event;
    }
    let masterKey = [];
    let slaveKey = [];
    let source = this.masterTable;
    let target = this.slaveTable;
    d3.selectAll('.link-group .edge path')
    .each(function() {
      const path = d3.select(this);
      let split = path.attr('link').split(' ', 2);
      // tslint:disable-next-line: max-line-length
      let source: string = split[0];
      if ((split[0] === source || split[1] === source) && (split[0] === target || split[1] === target) ) {
        let temp = path.attr('masterkey');
        let temp1 = temp.split(',', 2);
        masterKey.push(temp1[0]);
        masterKey.push(temp1[1]);
        temp = path.attr('slavekey');
        temp1 = temp.split(',', 2);
        slaveKey.push(temp1[0]);
        slaveKey.push(temp1[1]);
    }
  });
    this.masterKey = [...masterKey];
    this.slaveKey = [...slaveKey];
    console.log(this.masterKey, this.slaveKey);
    d3.selectAll('g.node-group .wrapperDiv')
    .each(function(d: any) {
      const temp = d3.select(this);
      const div = temp.select('.title');
      if (div.text() === source || div.text() === target) {
      const content = temp.select('.divContent');
      content.selectAll('.tableRow')
      .each(function(){
        let tableRow = d3.select(this);
        let text = tableRow.select('.fieldname').text();
        if (masterKey.includes(text) || slaveKey.includes(text)) {
          tableRow.style('font-weight', 'bold')
          .style('font-size', '16px');
      }

      });

    }
  });
  }

}

