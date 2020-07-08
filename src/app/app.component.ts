import { Component, OnInit, AfterContentChecked, ChangeDetectionStrategy, Input } from '@angular/core';
import { Node, Edge, ClusterNode, Layout, DagreLayout, Orientation } from '@swimlane/ngx-graph';
import { nodes, clusters, links } from './data';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { D3ForceDirectedLayout } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import * as d3 from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { LinkDialogComponent } from './link-dialog/link-dialog.component';
import { IfStmt } from '@angular/compiler';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(public dialog: MatDialog, public linkdialog: MatDialog) {
  }
  panelOpenState = false;
  name = 'NGX-Graph Demo';
  modals = [];
  relations = [];
  source: string;
  target: string;
  masterTable: string;
  slaveTable: string = null;
  joinType: string;
  relationship: string;
  masterKey = [];
  slaveKey = [];
  removedTables = [];
  //layout: Layout = new D3ForceDirectedLayout();
  layout: Layout = new DagreLayout();
  originalNodes: Node[] = nodes;
  originalLinks: Edge[] = links;
  nodes: Node[] = nodes;
  links: Edge[] = links;

  // Graph Configuration
  draggingEnabled: boolean = false;
  panningEnabled: boolean = true;
  zoomEnabled: boolean = true;
  panOnZoom: boolean = true;
  autoZoom: boolean = false;
  autoCenter: boolean = false;
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();
  panToNode$: Subject<string> = new Subject();
  zoom = 0.3;
  zoomSpeed: number = 0.1;

  selectedNode(node: any) {
    let dialogRef = this.dialog.open(ModalDialogComponent, {
      data: node
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setInputs(result['Master Table']);
        this.masterTable = result['Master Table'];
        this.slaveTable = result['Slave Table'];
        this.source = result['Master Table'];
        this.target = result['Slave Table'];
        this.setKeys(result['Master Table'], result['Slave Table']);
        console.log(result);
      }
    });
}
  selectedLink(link) {
    let dialogRef = this.linkdialog.open(LinkDialogComponent, {
      data: link
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setInputs(result.source);
        this.masterTable = result.source;
        this.slaveTable = result.target;
        this.source = result.source;
        this.target = result.target;
        this.setKeys(result.source, result.target);
        console.log(result);
      }
    });

}
  ngOnInit() {
    for (const node of nodes) {
      this.modals.push(node.id);
    }
    console.log(this.modals);
  }
  getModals(event, modal) {
    if (event.target.checked) {
      this.removedTables = this.removedTables.filter(m => m !== modal);
      const node = this.originalNodes.filter(m => (m.id === modal));
      this.nodes = this.nodes.concat(node[0]);
      const source = this.originalLinks.filter(m => (m.source === modal));
      for (let temp of source) {
        if (!this.removedTables.includes(temp.source) && !this.removedTables.includes(temp.target)) {
          this.links = this.links.concat(temp);
          console.log(temp);
        }
      }
      const target = this.originalLinks.filter(m => (m.target === modal));
      for (let temp of target) {
        if (!this.removedTables.includes(temp.source) && !this.removedTables.includes(temp.target)) {
          this.links = this.links.concat(temp);
          console.log(temp);
        }
      }
      console.log(this.removedTables);
      console.log(this.nodes);
      console.log(this.links);
    }
    else {
      this.removedTables.push(modal);
      this.links = this.links.filter(m => (m.source !== modal));
      this.links = this.links.filter(m => (m.target !== modal));
      this.nodes = this.nodes.filter(m => m.id !== modal);
    }
  }
  setModal(event) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    this.setInputs(event);
    const svg = d3.select('svg');
    const graph = d3.select('.graph.chart');
    const g = d3.select('g.nodes');
    const gg = d3.select('g.links');
    let zoom: any = d3.zoom()
    .extent([[0, 0], [1600, 900]])
    .scaleExtent([0, 8])
    .on('zoom', zoomed);
    function zoomed() {
      const attr = graph.attr('transform');
      const str = attr.split('matrix(', 2)[1];
      const value = str.split(',', 6);
      // tslint:disable-next-line: max-line-length
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
        .scale(1.3)
        .translate( -(xPos) , -(yPos) )
      );

      }
      else {

      }
    });
  }
  setInputs(event) {
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
  }
  setRelation(event) {
    if (this.masterTable === null) {
      this.masterTable = event;
    }
    else {
      this.slaveTable = event;
    }

    let source = this.masterTable;
    let target = this.slaveTable;
    this.setKeys(source, target);
  }
  setKeys(source , target) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    let masterKey = [];
    let slaveKey = [];
    let joinType;
    d3.selectAll('.link-group .edge path')
    .each(function() {
      const path = d3.select(this);
      let split = path.attr('link').split(' ', 2);
      // tslint:disable-next-line: max-line-length
      let source: string = split[0];
      if ((split[0] === source || split[1] === source) && (split[0] === target || split[1] === target) ) {
        joinType = path.attr('joinType');
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
    this.joinType = joinType;
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

