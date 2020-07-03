import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import { DiagramModel } from './diagram/diagram.model';
import cola from 'cytoscape-cola';
interface Node {
  keys: any;
  name: string ;
  color: string;
  id: string | number;
  relation: string | number | boolean;
  type: string;
  x: number;
  y: number;
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
    const svg: any = d3.select('svg');
    /*.call(d3.zoom().scaleExtent([0.5, 8]).on('zoom', () => {
      svg.attr('transform', d3.event.transform);
   }));*/
    const width = 1600;
    const height = 1000;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const simulation: any = d3.forceSimulation()
    .force('center', d3.forceCenter( width / 2 , height / 2 ))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('collide', d3.forceCollide(270).strength(0.5))
    .force('link', d3.forceLink<any, any>().id(d => d.name).distance(450));

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

      let link;
      let selection;
      let selectedRelation;
      let selectedTable;
      let activeText;
      let activeRelation;
      let textsAndNodes;
      let navBar;
      let masterKey = [];
      let slaveKey = [];
      let checkedTables = {};
      let tableModel = '';
      const g = svg.append('g')
      .attr('transform', 'scale(0.5,0.5)')
      .attr('class', 'insideSVG');
      let members = [{
        label: 'None'
      }];
      let zoom: any = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0, 8])
      .on("zoom", zoomed);
      let checkBoxContent = '';
      for (let node of graph.nodes) {
        if (node.type === 'table') {
          // tslint:disable-next-line: max-line-length
          tableModel += '<tr><td class="tableRowModal" style="padding-left: 25px">' + node.name + '</td><td class="tableRowModal" style="text-align: center;"><input type="checkbox" id="' + node.name + '"></td></tr>';
          // tslint:disable-next-line: max-line-length
          checkBoxContent += '<input class="inputCheckbox" type="checkbox" id="' + node.name + '"><label class="inputCheckbox" for="' + node.name + '"> ' + node.name + '</label><br>';
          let element = {
            label: node.name
          };
          members.push(element);
        }
      }
      var config = {
        width: 200,
        container: svg,
        members,
        fontSize: 16,
        color: '#333',
        fontFamily: 'calibri',
        x: 20,
        y: 35,
        changeHandler: function(option) {
          // 'this' refers to the option group
          // Change handler code goes here
          selectedTable = option.label;
          selectedRelation = null;
          d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
          d3.selectAll('g.nodes ')
          .each(function(d: any) {
            const tem = d3.select(this);
            const temp = tem.select('.wrapperDiv');
            const div = temp.select('.wrapperDiv .title');
            if (div.text() === selectedTable) {

              svg.transition()
      .duration(1000)
      .call(zoom.transform,
        d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.6)
        .translate( -(d.x) , -(d.y) )
      );
            }
            else {

            }
          });
          let newText = navBar.select('.navBar');
          newText.html('<span class="selectedTable">Selected Table</span><span class="selectedRelation">Selected Relation</span>');
          members = [{
            label: 'None'
          }];
          for (let link of graph.links) {
              if (link.source['name'] === selectedTable || link.target['name'] === selectedTable) {
                let str = link.source['name'] + '  --->  ' + link.target['name'];
                let element = {
                  label: str
                };
                members.push(element);
              }
            }
          let newConfig = {
              width: 250,
              container: svg,
              members,
              fontSize: 16,
              color: '#333',
              fontFamily: 'calibri',
              x: 700,
              y: 35,
              changeHandler: function(option) {
                // 'this' refers to the option group
                // Change handler code goes here
                let temp = option.label;
                masterKey = [];
                slaveKey = [];
                d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
                temp = temp.split('  --->  ', 2);
                selectedRelation = (temp[0] === selectedTable) ? temp[1] : temp[0];
                resetSimultaion();
                d3.selectAll('g.nodes .wrapperDiv')
          .each(function() {
            const temp = d3.select(this);
            const div = temp.select('.title');
            if (div.text() === selectedTable || div.text() === selectedRelation) {
            }
            else {

            }
          });
                d3.selectAll('.links line').each(function() {
            const selectedLink = d3.select(this);
            let split = selectedLink.attr('link').split(' ', 2);
            // tslint:disable-next-line: max-line-length
            if ((split[0] === selectedTable || split[1] === selectedTable) && (split[0] === selectedRelation || split[1] === selectedRelation) ) {
              let newText = navBar.select('.navBar');
              newText.html('<span class="selectedTable">Selected Table</span><span class="selectedRelation">Selected Relation</span><span class="relationType">Relationship : ' + selectedLink.attr('relationship') + '</span><span class="joinType">Join Type : ' + selectedLink.attr('joinType') + ' Join</span>');
              let temp = selectedLink.attr('masterkey');
              let temp1 = temp.split(',', 2);
              masterKey.push(temp1[0]);
              masterKey.push(temp1[1]);
              temp = selectedLink.attr('slavekey');
              temp1 = temp.split(',', 2);
              slaveKey.push(temp1[0]);
              slaveKey.push(temp1[1]);
            }
          });
                console.log(masterKey, slaveKey);
                d3.selectAll('g.nodes .wrapperDiv')
          .each(function() {
            const temp = d3.select(this);
            const div = temp.select('.title');
            if (div.text() === selectedTable || div.text() === selectedRelation) {
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
            };
          // svgDropDown(newConfig, 'optionRelation');
          showTransition();
          resetSimultaion();
        }
      };
      function svgDropDown(options, classname) {
        if (typeof options !== 'object' || options === null || !options.container) {
          console.error(new Error('Container not provided'));
          return;
        }
        const defaultOptions = {
          width: 200,
          members: [],
          fontSize: 12,
          color: '#333',
          fontFamily: 'Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif',
          x: 0,
          y: 0,
          changeHandler: function() {}
        };

        options = { ...defaultOptions,
          ...options
        };

        options.optionHeight = options.fontSize * 2;
        options.height = options.fontSize + 8;
        options.padding = 5;
        options.hoverColor = '#316EA4';
        options.hoverTextColor = '#fff';
        options.bgColor = '#fff';
        options.width = options.width - 2;

        const g = options.container
          .append('svg')
          .attr('x', options.x)
          .attr('y', options.y)
          .attr('shape-rendering', 'crispEdges')
          .append('g')
          .attr('transform', 'translate(1,1)')
          .attr('font-family', options.fontFamily);

        let selectedOption =
          options.members.length === 0 ? {
            label: ''
          } :
          options.members[0];

        /** Rendering Select Field */
        const selectField = g.append('g');

        // background
        selectField
          .append('rect')
          .attr('width', options.width)
          .attr('height', options.height)
          .attr('class', 'option select-field')
          .attr('fill', options.bgColor)
          .style('stroke', '#a0a0a0')
          .style('stroke-width', '1');

        // text
        if (classname === 'optionTable') {
          activeText = selectField
          .append('text')
          .text(selectedOption.label)
          .attr('x', options.padding)
          .attr('y', options.height / 2 + options.fontSize / 3)
          .attr('font-size', options.fontSize)
          .attr('fill', options.color);
        }
        else if (classname === 'optionRelation') {
          activeRelation = selectField
          .append('text')
          .text(selectedOption.label)
          .attr('x', options.padding)
          .attr('y', options.height / 2 + options.fontSize / 3)
          .attr('font-size', options.fontSize)
          .attr('fill', options.color);
        }
        // arrow symbol at the end of the select box
        selectField
          .append('text')
          .text('▼')
          .attr('x', options.width - options.fontSize - options.padding)
          .attr('y', options.height / 2 + (options.fontSize - 2) / 3)
          .attr('font-size', options.fontSize - 2)
          .attr('fill', options.color);

        // transparent surface to capture actions
        selectField
          .append('rect')
          .attr('width', options.width)
          .attr('height', options.height)
          .style('fill', 'transparent')
          .on('click', handleSelectClick);

        /** rendering options */
        const optionGroup = g
          .append('g')
          .attr('transform', `translate(0, ${options.height})`)
          .attr('opacity', 0); //.attr('display', 'none'); Issue in IE/Firefox: Unable to calculate textLength when display is none.

        // Rendering options group
        const optionEnter = optionGroup
          .selectAll('g')
          .data(options.members)
          .enter()
          .append('g')
          .on('click', handleOptionClick);

        // Rendering background
        optionEnter
          .append('rect')
          .attr('width', options.width)
          .attr('height', options.optionHeight)
          .attr('y', function(d, i) {
            return i * options.optionHeight;
          })
          .attr('class', classname)
          .style('stroke', options.hoverColor)
          .style('stroke-dasharray', (d, i) => {
            let stroke = [
              0,
              options.width,
              options.optionHeight,
              options.width,
              options.optionHeight
            ];
            if (i === 0) {
              stroke = [
                options.width + options.optionHeight,
                options.width,
                options.optionHeight
              ];
            } else if (i === options.members.length - 1) {
              stroke = [0, options.width, options.optionHeight * 2 + options.width];
            }
            return stroke.join(' ');
          })
          .style('stroke-width', 1)
          .style('fill', options.bgColor);

        // Rendering option text
        optionEnter
          .append('text')
          .attr('x', options.padding)
          .attr('y', function(d, i) {
            return (
              i * options.optionHeight +
              options.optionHeight / 2 +
              options.fontSize / 3
            );
          })
          .text(function(d) {
            return d.label;
          })
          .attr('font-size', options.fontSize)
          .attr('fill', options.color)
          .each(wrap);

        // Rendering option surface to take care of events
        optionEnter
          .append('rect')
          .attr('width', options.width)
          .attr('height', options.optionHeight)
          .attr('y', function(d, i) {
            return i * options.optionHeight;
          })
          .style('fill', 'transparent')
          .on('mouseover', handleMouseOver)
          .on('mouseout', handleMouseOut);

        //once the textLength gets calculated, change opacity to 1 and display to none
        optionGroup.attr('display', 'none').attr('opacity', 1);

        d3.select('body').on('click', function() {
          optionGroup.attr('display', 'none');
        });

        // Utility Methods
        function handleMouseOver() {
          d3.select(d3.event.target.parentNode)
            .select('.' + classname)
            .style('fill', options.hoverColor);

          d3.select(d3.event.target.parentNode)
            .select('text')
            .style('fill', options.hoverTextColor);
        }

        function handleMouseOut() {
          d3.select(d3.event.target.parentNode)
            .select('.' + classname)
            .style('fill', options.bgColor);

          d3.select(d3.event.target.parentNode)
            .select('text')
            .style('fill', options.color);
        }

        function handleOptionClick(d) {
          d3.event.stopPropagation();
          selectedOption = d;
          if (classname === 'optionTable') {
            activeText.text(selectedOption.label).each(wrap);
          }
          else if (classname === 'optionRelation') {
            activeRelation.text(selectedOption.label).each(wrap);
          }
          typeof options.changeHandler === 'function' && options.changeHandler.call(this, d);
          optionGroup.attr('display', 'none');
        }

        function handleSelectClick() {
          d3.event.stopPropagation();
          const visibility = optionGroup.attr('display') === 'block' ? 'none' : 'block';
          optionGroup.attr('display', visibility);
        }

        // wraps words
        function wrap() {
          const width = options.width;
          const padding = options.padding;
          const self = d3.select(this);
          let textLength = self.node().getComputedTextLength();
          let text = self.text();
          const textArr = text.split(/\s+/);
          let lastWord = '';
          while (textLength > width - 2 * padding && text.length > 0) {
            lastWord = textArr.pop();
            text = textArr.join(' ');
            self.text(text);
            textLength = self.node().getComputedTextLength();
          }
          self.text(text + ' ' + lastWord);

          // providing ellipsis to last word in the text
          if (lastWord) {
            textLength = self.node().getComputedTextLength();
            text = self.text();
            while (textLength > width - 2 * padding && text.length > 0) {
              text = text.slice(0, -1);
              self.text(text + '...');
              textLength = self.node().getComputedTextLength();
            }
          }
        }
      }
      createSimulation();
      function createSimulation() {
        link = g.append('g')
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
        .on('click', function(d: any){

          if (selectedTable !== d.source['name']) {
            selectedTable = d.source['name'];
          }
          else if (selectedTable !== d.target['name']) {
            selectedTable = d.target['name'];
          }
          showTransition();
          activeText.text(selectedTable);
          resetSimultaion();
        })
        .attr('relationship', (d: any) => d.relationship)
        .attr('masterkey', (d: any) => {
          return d.masterkey;
        })
        .attr('slavekey', (d: any) => {
          return d.slavekey;
        })
        .attr('joinType', (d: any) => d.joinType)
        .attr('stroke-width', 8)
        .attr('stroke', (d) => {
            return '#b0adac';
        } )
        .attr('stroke-opacity', 0.6)
        ;

        textsAndNodes = g.append('g')
        .selectAll('g')
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
        .append('g')
        .attr('class', 'nodes')
        .on('click', clicked)
        .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));


        let active = d3.select(null);
        function clicked(d) {
          if (d3.event.defaultPrevented) {
            return;
          }
          let selectedNode = d3.select(this);
          selectedTable = selectedNode.select('.title').text();
          activeText.text(selectedTable);
        //  d.px = width / 2;
         // d.py = height / 2;
         // d.x = d.x + 0.8 * (d.px - d.x);
         // d.y = d.y + 0.8 * (d.py - d.y);
          /*d.fx = width / 2;
          d.fy = height / 2;

          simulation.alphaTarget(0.1).restart();
          setTimeout(function(){
            console.log(simulation.alpha().toPrecision(6));
            d.fx = null;
            d.fy = null;
            simulation.alphaTarget(0);
          }, 5000);
          // simulation.force('collide', d3.forceCollide(30).strength(0.7));
          svg.transition()
      .duration(1000)
      .call(zoom.transform,
        d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.6)
        .translate( -(d.fx) , -(d.fy) )
      );
*/

          showTransition();
        }

        link.append('title')
        .text((d) => d.relationship);
        simulation
        .nodes(graph.nodes as any)
        .on('tick', ticked);

        simulation.force('link')
        .links(graph.links);
        update();


      }
      navBar = svg.append('foreignObject')
      .attr('transform', 'translate(0, 0)')
      .attr('width', 1600)
      .attr('height', 80)
      // tslint:disable-next-line: max-line-length
      .html('<div class="navBar"><span class="selectedTable">ERD-D3</span></div>');
      // svgDropDown(config, 'optionTable');
      function showTransition() {
        /*svg.transition()
      .duration(800)
      .call(zoom.transform,
        d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(2)
        .translate( -(width / 2) + 300 , -(height / 2) + 100 )
      );
        d3.selectAll('.links line').each(function() {
          const selectedLink = d3.select(this);
          let split = selectedLink.attr('link').split(' ', 2);
          if (split[0] === selectedTable || split[1] === selectedTable) {
            selectedLink.attr('stroke', '#525151');
          }
          else {
            selectedLink.attr('stroke', '#b0adac');
          }
        });*/
      }
      function resetSimultaion() {
        simulation.alphaTarget(0.1).restart();
        setTimeout(function(){simulation.alphaTarget(0);
        }, 1000);
      }
      function update() {
        // keyIcons = svg.append('g')
         // .attr('class', 'keyIcons');
        let i = 0;
        d3.selectAll('g.nodes')
        .each(function(d) {
          const gg = d3.select(this);
          // console.log(words);
          let graphNode = graph.nodes[i];
          let htmlStr = '';
          let length;
          let maxLength = 0;
          let maxWidth;
          let optimumWidth = 320;
          let img = '';
          for (let node of graphNode['keys']) {
            if (node.type === 'primary_key') {
              img = 'primarykey';
            }
            else if (node.type === 'foreign_key') {
              img = 'foreignkey';
            }
            else if (node.type === 'field') {
              img = 'fields';
            }

           // tslint:disable-next-line: max-line-length
            htmlStr += '<tr class="tableRow"><td class="keyAndIcon"><span class="KeyIcon"><img src="assets/' + img + '.png" width="17px" height="17px"></img></span><span class="fieldname">' + node.name + '</span></td><td class="dataType">' + node.dataType + '</td></tr>';
            length = node.name.length + node.type.length;
            if (maxLength < length) {
             maxLength = length;
           }
          }
          if (graphNode['keys'].length <= 4) {
            maxWidth = (maxLength * 10) + 40;
          }
          else {
            maxWidth = (maxLength * 10) + 40 + 20;
          }
          if (maxWidth < optimumWidth) {
            maxWidth = optimumWidth;
          }
          gg.append('foreignObject')
          .attr('transform', 'translate(0,30)')
          .attr('width', maxWidth.toString())
          .attr('height', 200)
          // tslint:disable-next-line: max-line-length
          .html('<div class="wrapperDiv" style="background-color:' + color(graphNode.name)  + '"><div class="title"><h1>' + graphNode.name + '</h1></div><div class="divContent"><table>' + htmlStr + '</table></div></div>');
          i++;
        });
      }
      g.on('click', function() {
        let newText = navBar.select('.navBar');
              // tslint:disable-next-line: max-line-length
        newText.html('<span class="selectedTable">ERD-D3</span>');
        d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
      });
      svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0, 8])
      .on("zoom", zoomed));
      svg.append("foreignObject")
        .attr('class', 'checkboxList')
        .attr("width", 200)
        .attr("height", 400)
        .attr('transform', 'translate(300,60)')
        .append("xhtml:body")
        .html('<div class="checkboxContent tableCheckbox"><form>' + checkBoxContent + '</form><div>')
        .on("click", function(d, i){
          d3.selectAll('.tableCheckbox input')
          .each(function() {
          });
        });
      svg.append("foreignObject")
        .attr('class', 'zoomIn')
        .attr("width", 80)
        .attr("height", 80)
        .attr('transform', 'translate(1400,580)')
        .append("xhtml:body")
        .html('<a class="btn"><h1 class="zoomin">↻</h1></a>')
        .on('click', function() {
          let xArray = [];
          let x = 0;
          let y = 0;
          let yArray = []
          d3.selectAll('g.nodes ')
          .each(function(d: any) {
            const tem = d3.select(this);
            x += d.x;
            y += d.y;
            xArray.push(d.x);
            yArray.push(d.y);
          });
          svg.transition()
      .duration(1000)
      .call(zoom.transform,
        d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.4)
        .translate( -(x / xArray.length) , -(y / yArray.length)) );
        });
      svg.append("foreignObject")
        .attr('class', 'zoomIn')
        .attr("width", 80)
        .attr("height", 80)
        .attr('transform', 'translate(1400,640)')
        .append("xhtml:body")
        .html('<a class="btn"><h1 class="zoomin">+</h1></a>')
        .on('click', function() {
          svg.transition().call(zoom.scaleBy, 2);
        });
      svg.append("foreignObject")
        .attr('class', 'zoomIn')
        .attr("width", 80)
        .attr("height", 80)
        .attr('transform', 'translate(1400,700)')
        .append("xhtml:body")
        .html('<a class="btn"><h1 class="zoomin">-</h1></a>')
        .on('click', function() {
          svg.transition().call(zoom.scaleBy, 0.5);
        });
      function zoomed() {
    g.attr("transform", d3.event.transform);
  }
      svg.on('dblclick.zoom', null);
      svg.append('text')
      .attr('font-size', '20px')
      .attr('fill', 'white')
    .attr('x', 300)
    .attr('y', 50)
    .style('cursor', 'pointer')
    .text('View Tables ▼')
    .on('click', function() {
      d3.select('.openModal')
      .style('display', 'block');
      d3.select('.modalSearch')
      .style('display', 'block');
    });
      svg.append('text')
    .attr('font-size', '20px')
    .attr('fill', 'white')
  .attr('x', 500)
  .attr('y', 50)
  .style('cursor', 'pointer')
  .text('Filter ▼')
  .on('click', function() {
    d3.select('.openModal')
    .style('display', 'block');
    d3.select('.modal')
    .style('display', 'block');
  });
      svg.append('foreignObject')
      .attr('class', 'openModal')
      .style('background-color', '#333')
      .style('display', 'none')
    .style('opacity', '0.3')
    .attr("width", width)
  .attr("height", height)
  .attr('transform', 'translate(0,0)');
      svg.append("foreignObject")
  .attr('class', 'modal')
  .attr("width", width)
  .attr("height", height)
  .style('display', 'none')
  .attr('transform', 'translate(0,0)')
  .append("xhtml:body")
  .html('<div class="tablesModal"><div class="modalHeader"><span>Filter</span><span class="icon"><img src="assets/filter.png" width="27px" height="27px"></img></span></div><br><hr><div class="tablesModalContent"><div  class="modalContentHeader"><span class="modalContentHeaderTitle">Tables</span></div><div class="modalContent"><table>' + tableModel + '</table></div></div><br><hr><button class="button">Close</button></div>');
      d3.select('.button').on('click', function() {
        d3.select('.openModal')
        .style('display', 'none');
        d3.select('.modal')
        .style('display', 'none');
});
      d3.selectAll('.modalContent input').attr('checked', 'checked');
      d3.selectAll('.modalContent input')
.on('click', function() {
  let check: any = d3.select(this);
  let key = check.node().id;
  if (check.node().checked) {
    d3.selectAll('g.links line')
    .each(function(d: any) {
    const temp = d3.select(this);
    const str = temp.attr('link');
    let split = str.split(' ', 2);
    if (split[1] === key || split[0] === key) {
          temp.style('display', 'block');
          d3.selectAll('g.nodes').each(function(){
            const tem = d3.select(this);
            const temp1 = tem.select('.wrapperDiv');
            const div = temp1.select('.wrapperDiv .title');
            if (div.text() === key) {
              tem.style('display', 'block');
            }
          });
        }
        });
    }
    else {
      d3.selectAll('g.links line')
.each(function(d: any) {
const temp = d3.select(this);
const str = temp.attr('link');
let split = str.split(' ', 2);
if (split[1] === key || split[0] === key) {
      temp.style('display', 'none');
      d3.selectAll('g.nodes').each(function(){
        const tem = d3.select(this);
        const temp1 = tem.select('.wrapperDiv');
        const div = temp1.select('.wrapperDiv .title');
        if (div.text() === key) {
          tem.style('display', 'none');
        }
      });
    }
    });
  }
});
// this
      svg.append("foreignObject")
.attr('class', 'modalSearch')
.attr("width", width)
.attr("height", height)
.style('display', 'none')
.attr('transform', 'translate(0,0)')
.append("xhtml:body")
.html('<div class="tablesModal search"><div class="modalHeader"><span>Search</span><span class="icon"><img src="assets/search.png" width="30px" height="30px"></img></span></div><br><hr><div class="tablesModalContent"><div  class="modalContentHeader"><span class="modalContentHeaderTitle">Tables</span></div><div class="modalContent"><table>' + tableModel + '</table></div></div><br><hr><button class="button search">Close</button></div>');
      d3.select('.button.search').on('click', function() {
      d3.select('.openModal')
      .style('display', 'none');
      d3.select('.modalSearch')
      .style('display', 'none');

});

      d3.selectAll('.tablesModal.search .modalContent input').on('click', function() {
        let check: any = d3.select(this);
        let key = check.node().id;
        if (check.node().checked) {
          d3.selectAll('g.nodes')
          .each(function(d: any) {
            const temp = d3.select(this);
            const div = temp.select('.wrapperDiv .title');
            if (div.text() === key) {
              d.fx = width / 2;
              d.fy = height / 2;
              simulation.alphaTarget(0.1).restart();
              setTimeout(function() {
                d.fx = null;
                d.fy = null;
                simulation.alphaTarget(0);
              }, 4000);
            }
          });
          svg.transition()
        .duration(1000)
        .call(zoom.transform,
          d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(0.6)
          .translate( -(width / 2) , -(height / 2) )
        );
        } else {
            }
          });
      svg.transition()
      .duration(1000)
      .call(zoom.transform,
        d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.3)
        .translate( -(width / 2) , -(height / 2) )
      );
      svg.append("foreignObject")
.attr('class', 'modalSelect')
.attr("width", width)
.attr("height", height)
.attr('transform', 'translate(0,0)')
.style('display', 'none')
.append("xhtml:body")
.html('');
      textsAndNodes.on('click', function() {
        console.log('Yess');
        const temp = d3.select(this);
        const wrapper = temp.select('.wrapperDiv');
        const title = wrapper.select('.title').text();
        selectionModal(title);
});
      function selectionModal(title) {
        let  tableContentField = '';
        let tableContentRelationship = '';
        for (let node of graph.nodes) {
          if (node.name === title) {
            for (let key of node.keys) {
              tableContentField += '<tr><td class="tableRowModal" style="padding-left: 25px">' + key.name + '</td><td class="tableRowModal" style="text-align: center;">' + key.dataType + '</td></tr>';
            }
          }
        }
        for (const Glink of graph.links) {
          if (Glink.source['name'] === title || Glink.target['name'] === title) {
            // tslint:disable-next-line: max-line-length
            tableContentRelationship += '<tr class="selectionRow"><td class="tableRowModal source" style="padding-left: 25px">' + Glink.source['name'] + '</td><td class="tableRowModal" style="text-align: center;"><i> ' + Glink.relationship + '</i> </td><td class="tableRowModal target" style="text-align: center;">' + Glink.target['name'] + '</td></tr>';
          }
        }
        d3.select('.openModal')
          .style('display', 'block');
        d3.select('.modalSelect').style('display', 'block');
        d3.select('.modalSelect').html('<div class="tablesModalSelect"><div  class="modalHeader"><span>' + title + '</span><span class="icon"><img src="assets/database.png" width="30px" height="30px"></img></span></div><br><hr><div class="modalContainer"><div class="tablesModalSelectContent"><div  class="modalContentHeader"><span class="modalContentHeaderTitle">Attributes</span></div><div class="modalContent"><table>' + tableContentField + '</table></div></div><br><hr><div class="tablesModalSelectContent"><div  class="modalContentHeader"><span class="modalContentHeaderTitle">Relationships</span></div><div class="modalContent"><table>' + tableContentRelationship + '</table></div></div></div><br><button class="button select">Close</button></div>');
        d3.select('.button.select').on('click', function() {
          d3.select('.openModal')
          .style('display', 'none');
          d3.select('.modalSelect')
          .style('display', 'none');
      });
        d3.selectAll('.selectionRow').on('click', function() {
          masterKey = [];
          slaveKey = [];
          d3.selectAll('.tableRow').style('font-weight', 'unset').style('font-size', '14px');
          const temp = d3.select(this);
          const source = temp.select('.tableRowModal.source').text();
          const target = temp.select('.tableRowModal.target').text();
          console.log(source, target);
          d3.selectAll('.links line').each(function() {
            const selectedLink = d3.select(this);
            let split = selectedLink.attr('link').split(' ', 2);
            // tslint:disable-next-line: max-line-length
            if ((split[0] === source || split[1] === source) && (split[0] === target || split[1] === target) ) {
              let newText = navBar.select('.navBar');
              // tslint:disable-next-line: max-line-length
              newText.html('<span class="selectedTable">ERD-D3</span><span class="relationType">Relationship : ' + selectedLink.attr('relationship') + '</span><span class="joinType">Join Type : ' + selectedLink.attr('joinType') + ' Join</span>');
              let tempp = selectedLink.attr('masterkey');
              let temp1 = tempp.split(',', 2);
              masterKey.push(temp1[0]);
              masterKey.push(temp1[1]);
              tempp = selectedLink.attr('slavekey');
              temp1 = tempp.split(',', 2);
              slaveKey.push(temp1[0]);
              slaveKey.push(temp1[1]);
            }
          });
          console.log(masterKey, slaveKey);
          let x = 0;
          let y = 0;
          d3.selectAll('g.nodes')
          .each(function(d: any) {
            const temp1: any = d3.select(this);
            const tem = temp1.select('.wrapperDiv');
            const div = temp1.select('.title');
            if (div.text() === source || div.text() === target) {
            x += d.x ;
            y += d.y ;
            const content = tem.select('.divContent');
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
          d3.select('.openModal')
          .style('display', 'none');
          d3.select('.modalSelect')
          .style('display', 'none');
          svg.transition()
          .duration(1000)
          .call(zoom.transform,
            d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(0.8)
            .translate( -(x / 2) , -(y / 2) )
          );

        });
      }
      setTimeout(function() {
          simulation.force('collide', d3.forceCollide(140).strength(0.8));
        }, 1400);
      function ticked() {
        textsAndNodes
        .attr('transform', function(d){
          let str = 'translate(' + (d.x - 160) + ',' + (d.y - 100) + ')';
          return str;
        });
        link
          .attr('x1', function(d: any) { return d.source.x; })
          .attr('y1', function(d: any) { return d.source.y; })
          .attr('x2', function(d: any) { return d.target.x; })
          .attr('y2', function(d: any) { return d.target.y; })
          .attr('link', (d: any) => {
            return d.source['name'] + ' ' + d.target['name'];
          })
          ;
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
