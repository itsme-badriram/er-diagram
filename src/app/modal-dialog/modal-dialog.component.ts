import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Node, Edge } from '@swimlane/ngx-graph';
import { nodes, links } from '../data';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ModalDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ModalDialogComponent> ,@Inject(MAT_DIALOG_DATA) public node: Node) { }
  displayedColumns: string[] = ['name', 'dataType'];
  dataSource: any;
  links: Edge[] = links;
  relationships: any;
  relationshipColumns: string[] = ['Table', 'Relationship' , 'Related Table'];
  expandedElement: any;
  onClose() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.dataSource = this.node.data.keys;
    this.relationships = [];
    for (const link of links) {
      if (link.source === this.node.id || link.target === this.node.id) {
        let relationship = {
          'Table': '',
          Relationship : '',
          'Related Table' : '',
          'Master Key' : [],
          'Slave Key' : [],
          'Join Type' : ''
        };
        if (link.source === this.node.id) {
          relationship['Table'] = this.node.id;
          relationship['Related Table'] = link.target;
        }
        else if (link.target === this.node.id) {
          relationship['Table'] = this.node.id;
          relationship['Related Table'] = link.source;
        }
        let split = link.data.masterkey;
        for ( const key of split) {
          relationship['Master Key'].push(key.name);
        }
        split = link.data.slavekey;
        for ( const key of split) {
          relationship['Slave Key'].push(key.name);
        }
        relationship.Relationship = link.data.relationship;
        relationship['Join Type'] = link.data.joinType;
        this.relationships.push(relationship);
      }

    }
  }

}
