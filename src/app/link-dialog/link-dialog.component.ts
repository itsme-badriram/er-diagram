import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Edge } from '@swimlane/ngx-graph';
@Component({
  selector: 'app-link-dialog',
  templateUrl: './link-dialog.component.html',
  styleUrls: ['./link-dialog.component.css']
})
export class LinkDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LinkDialogComponent> , @Inject(MAT_DIALOG_DATA) public link: Edge) { }

  ngOnInit(): void {
  }
  onClose() {
    this.dialogRef.close();
  }
}
