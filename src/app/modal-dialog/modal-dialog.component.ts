import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Node, Edge } from '@swimlane/ngx-graph';
import { nodes, links } from '../data';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public node: Node) { }
  displayedColumns: string[] = ['name', 'dataType'];
  dataSource: any;
  links: Edge[] = links;
  relationships: any;
  relationshipColumns: string[] = ['source', 'relationship' , 'target'];
  ngOnInit(): void {
    this.dataSource = this.node.data.keys;
    this.relationships = [];
    for (const link of links) {
      if (link.source === this.node.id || link.target === this.node.id) {
        let relationship = {
          source : '',
          relationship : '',
          target : ''
        };
        if (link.source === this.node.id) {
          relationship.source = this.node.id;
          relationship.target = link.target;
        }
        else if (link.target === this.node.id) {
          relationship.source = link.source;
          relationship.target = this.node.id;
        }
        relationship.relationship = link.data.relationship;
        this.relationships.push(relationship);
      }

    }
  }

}
