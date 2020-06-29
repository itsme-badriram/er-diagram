import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';
import { DiagramModel } from './diagram/diagram.model';
import { active } from 'd3';

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
    const svg = d3.select('svg');
    /*.call(d3.zoom().scaleExtent([0.5, 8]).on('zoom', () => {
      svg.attr('transform', d3.event.transform);
   }));*/
    const width = 1600;
    const height = 1000;
    /*let zoom: any = d3.zoom()
    .scaleExtent([-1 , 8])
    .on('zoom', zoomed); */
    function zoomed() {
      svg.attr('transform', d3.event.transform);
    }
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const simulation: any = d3.forceSimulation()
    .force('center', d3.forceCenter( width / 2 , height / 2 ))
    .force('charge', d3.forceManyBody().strength(-50))
    .force('collide', d3.forceCollide(250).strength(0.9))
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
      let selectedRelation;
      let selectedTable;
      let activeText;
      let activeRelation;
      let textsAndNodes;
      let navBar;
      let masterKey = [];
      let slaveKey = [];
      let members = [{
        label: 'None'
      }];
      for (let node of graph.nodes) {
        if (node.type === 'table') {
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
          d3.selectAll('g.nodes .wrapperDiv')
          .each(function() {
            const temp = d3.select(this);
            const div = temp.select('.title');
            if (div.text() === selectedTable) {
              temp.style('background-color', '#de5d83');

            }
            else {
              temp.style('background-color', '#316EA4');
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
              width: 500,
              container: svg,
              members,
              fontSize: 16,
              color: '#333',
              fontFamily: 'calibri',
              x: 500,
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
              temp.style('background-color', '#de5d83');

            }
            else {
              temp.style('background-color', '#316EA4');
            }
          });
                d3.selectAll('.links line').each(function() {
            const selectedLink = d3.select(this);
            let split = selectedLink.attr('link').split(' ', 2);
            // tslint:disable-next-line: max-line-length
            if ((split[0] === selectedTable || split[1] === selectedTable) && (split[0] === selectedRelation || split[1] === selectedRelation) ) {
              let newText = navBar.select('.navBar');
              newText.html('<span class="selectedTable">Selected Table</span><span class="selectedRelation">Selected Relation</span><span class="relationType"><b>Relationship</b> : ' + selectedLink.attr('relationship') + '</span><span class="joinType"><b>Join Type</b> : ' + selectedLink.attr('joinType') + ' Join</span>');
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
          svgDropDown(newConfig, 'optionRelation');
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

        textsAndNodes = svg.append('g')
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
      .html('<div class="navBar"><span class="selectedTable">Selected Table</span></div>');
      svgDropDown(config, 'optionTable');
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
        setInterval(function(){simulation.alphaTarget(0);
        }, 1000);
      }
      function update() {
        // keyIcons = svg.append('g')
         // .attr('class', 'keyIcons');
        let i = 0;
        d3.selectAll('g.nodes')
        .each(function(d) {
          const g = d3.select(this);
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
            htmlStr += '<tr class="tableRow"><td class="keyAndIcon"><span class="KeyIcon"><img src="assets/' + img + '.png"></img></span><span class="fieldname">' + node.name + '</span></td><td>' + node.dataType + '</td></tr>';
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
          g.append('foreignObject')
          .attr('transform', 'translate(0,30)')
          .attr('width', maxWidth.toString())
          .attr('height', 200)
          // tslint:disable-next-line: max-line-length
          .html('<div class="wrapperDiv"><div class="title"><h1>' + graphNode.name + '</h1></div><div class="divContent"><table>' + htmlStr + '</table></div></div>');
          i++;
        });
      }

      function ticked() {
        if (selectedRelation) {
          for (let node of graph.nodes) {
            if (node.name === selectedRelation) {
              node.x = width / 3.5;
              node.y = height / 2.5;
            }
            if (node.name === selectedTable) {
              node.x = width / 1.5;
              node.y = height / 2.5;
            }
          }
        }
        else if (selectedTable) {
          for (let node of graph.nodes) {
            if (node.name === selectedTable) {
              node.x = width / 2;
              node.y = height / 2;
              break;
            }
          }
        }
        textsAndNodes
        .attr('transform', function(d){
          let str = 'translate(' + (d.x - 50) + ',' + (d.y - 50) + ')';
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
