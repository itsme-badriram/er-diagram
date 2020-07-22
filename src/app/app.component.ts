import { Component, OnInit, AfterContentChecked, ChangeDetectionStrategy, Input, ViewEncapsulation } from '@angular/core';
import { Node, Edge, ClusterNode, Layout, DagreLayout, Orientation } from '@swimlane/ngx-graph';
import { nodes, clusters, links } from './data';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { D3ForceDirectedLayout } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import * as d3 from 'd3';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { FilterPipe } from './filter.pipe';
import { Pipe, PipeTransform } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  constructor(public dialog: MatDialog) {
  }
  searchText;
  relationPanelOpenState = true;
  panelOpenState = false;
  modals = [];
  relations = [];
  source: string = null;
  target: string;
  masterTable: string;
  slaveTable: string = null;
  joinType: string;
  relationship: string;
  masterKey = [];
  slaveKey = [];
  removedTables = [];
  unselectAll = true;
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
  autoZoom: boolean = true;
  autoCenter: boolean = true;
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<boolean> = new Subject();
  panToNode$: Subject<string> = new Subject();
  zoom = 0.3;
  zoomSpeed: number = 0.1;

  getTooltip(link): string {
    let masterkey = [];
    let slavekey = [];
    for ( const key of link.data.masterkey) {
      masterkey.push(key.name);
    }
    for ( const key of link.data.slavekey) {
      slavekey.push(key.name);
    }
    let str = link.data.joinType + ' Join ';
    for (let i = 0; i < masterkey.length; i++) {
      str += '\n' + masterkey[i] + ' = ' + slavekey[i] ;
    }
    return str;
    }
    getKeys(keys) {
      let str = '';
      for (const key of keys) {
        str += key.name + ',';
      }
      str = str.substring(0, str.length - 1);
      return str;
    }
// Node Click
  selectedNode(node: any) {
    let dialogRef = this.dialog.open(ModalDialogComponent, {
      data: node
    });
}
  ngOnInit() {
    for (const node of nodes) {
      let element = {
        name: node.id,
        checked: true
      };
      this.modals.push(element);
    }
  }
  // On i Symbol Click
  onInfo(modal) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    this.panelOpenState = false;
    this.source = modal;
    this.setInputs(modal);
    this.setModal(modal);

  }
  // Check All/ Uncheck All
  checkAll(checked) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    this.source = null;
    this.unselectAll = checked;
    if (!checked) {
      for (const m of this.modals) {
        m.checked = false;
        this.removeTable(m.name);
      }
    }
    else {
      for (const m of this.modals) {
        m.checked = true;
        this.backToLife(m.name);
      }
    }
  }
  // Indeterminate State of Check All Box
  someChecked() {
    if (this.modals.filter(m => m.checked).length === this.modals.length) {
      return false;
    }
    else if (!this.unselectAll && this.modals.filter(m => m.checked).length > 0) {
      return true;
    }
    return this.unselectAll;
  }
  // Show All relations from respective Table
  showRelations(modal) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    d3.selectAll('.wrapperDiv').attr('style', '#0074a6');
    this.setModal(modal);
    this.source = null;
    this.setInputs(modal);
    for (const rel of this.relations) {
      const element = this.modals.filter(m => m.name === rel.name)[0];
      if (!element.checked) {
        this.backToLife(element.name);
        element.checked = true;
      }
    }
  }
  // Onchange Checkbox handler to view / remove relations - for 1st Expansion Panel.
  getModals(modal) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    d3.selectAll('.wrapperDiv').attr('style', '#0074a6');
    this.source = null;
    if (modal.checked) {
      this.backToLife(modal.name);
    }
    else {
      this.removeTable(modal.name);
    }
  }
  // Onchange Checkbox handler to view / remove relations. - for 2nd Expansion panel
  getRelations(modal) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    if (modal.checked) {
      this.backToLife(modal.name);
    }
    else {
      this.removeTable(modal.name);
    }
    let element = this.modals.filter(m => m.name === modal.name)[0];
    element.checked = !element.checked;
  }
  // General Function to remove a modal
  removeTable(modal) {
    this.removedTables.push(modal);
    this.links = this.links.filter(m => (m.source !== modal));
    this.links = this.links.filter(m => (m.target !== modal));
    this.nodes = this.nodes.filter(m => m.id !== modal);
  }
  // general function to bring back a modal to view
  backToLife(modal) {
    this.removedTables = this.removedTables.filter(m => m !== modal);
    const node = this.originalNodes.filter(m => (m.id === modal));
    this.nodes = this.nodes.concat(node[0]);
    const source = this.originalLinks.filter(m => (m.source === modal));
    for (let temp of source) {
      if (!this.removedTables.includes(temp.source) && !this.removedTables.includes(temp.target)) {
        this.links = this.links.concat(temp);
      }
    }
    const target = this.originalLinks.filter(m => (m.target === modal));
    for (let temp of target) {
      if (!this.removedTables.includes(temp.source) && !this.removedTables.includes(temp.target)) {
        this.links = this.links.concat(temp);
      }
    }
  }
  // Function that executes to change the color of selected table
  setModal(event) {
    d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
    this.setInputs(event);
    d3.selectAll('g.node-group')
    .each(function(d: any) {
      const temp = d3.select(this);
      const wrapperDiv = temp.select('.wrapperDiv');
      const title = wrapperDiv.select('.title');
      if (title.text() === event) {
        wrapperDiv.style('background-color', '#284066'); // Color Change Occurs
      }
      else {
        wrapperDiv.style('background-color', '#0074a6'); // Restore Normal Color
      }
    });
  }
  // Function to find all forward and backward relations of a given modal - (a.k.a event)
  setInputs(event) {
    this.relations = [];
    this.masterKey = [];
    this.slaveKey = [];
    for (const link of links) {
      if (link.source === event) {
        this.masterTable = event;
        this.slaveTable = null;
        let table = this.modals.filter(m => m.name === link.target)[0];
        let element = {
          name: link.target,
          checked: table.checked,
          arrow: '🡒'
        };
        this.relations.push(element);
      }
      if (link.target === event) {
        this.slaveTable = event;
        this.masterTable = null;
        let table = this.modals.filter(m => m.name === link.source)[0];
        let element = {
          name: link.source,
          checked: table.checked,
          arrow: '🡐'
        };
        this.relations.push(element);
      }
    }
  }
  // Function that bolds the keys on ERD for the given source and target tables.
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
        let temp1 = temp.split(',');
        for ( const key of temp1) {
          masterKey.push(key);
        }

        temp = path.attr('slavekey');
        temp1 = temp.split(',');
        for ( const key of temp1) {
          masterKey.push(key);
        }
        console.log(masterKey, slaveKey);
    }
  });
    this.joinType = joinType;
    this.masterKey = [...masterKey];
    this.slaveKey = [...slaveKey];
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
