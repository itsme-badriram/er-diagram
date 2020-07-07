import { Edge, Node, ClusterNode } from '@swimlane/ngx-graph';


export const nodes: Node[] = [
  {
    id: 'dbm_mrd_btl',
    label: 'dbm_mrd_btl',
    data: {
      type: 'table',
      keys: [
        {name: 'productcode', dataType: 'number', type: 'foreign_key' },{name : 'accountkey', type : 'primary_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key', dataType: 'string'},
        {name : 'key_23', type : 'field', dataType: 'integer'},
        {name : 'key_1', type : 'field', dataType: 'double'},
        {name : 'key_2', type : 'field', dataType: 'string'},
        {name : 'key_23', type : 'field' , dataType: 'integer'}
      ]
    }
  }, {
    id: 'table_2',
    label: 'table_2',
    data: {
      type: 'table',
      keys: [
        {name : 'accountkey', type : 'foreign_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key' , dataType: 'string'},
        {name : 'key_3', type : 'field', dataType: 'integer'},
        {name : 'key_4', type : 'field', dataType: 'double'}
      ]
    }
  }, {
    id: 'table_3',
    label: 'table_3',
    data: {
      type: 'table',
      keys: [
        {name : 'gsn', type : 'foreign_key' , dataType: 'number'},
        {name : 'cob_dt', type : 'foreign_key', dataType: 'number'},
        {name : 'key_5keykey', type : 'primary_key', dataType: 'string'},
        {name : 'key_5', type : 'field', dataType: 'double'}
      ]
    }
  },
  {
    id: 'dbm_mrd_btl1',
    label: 'dbm_mrd_btl1',
    data: {
      type: 'table',
      keys: [
        {name: 'productcode', dataType: 'number', type: 'foreign_key' },{name : 'accountkey', type : 'primary_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key', dataType: 'string'},
        {name : 'key_23', type : 'field', dataType: 'integer'},
        {name : 'key_1', type : 'field', dataType: 'double'},
        {name : 'key_2', type : 'field', dataType: 'string'},
        {name : 'key_23', type : 'field' , dataType: 'integer'}
      ]
    }
  }, {
    id: 'table_21',
    label: 'table_21',
    data: {
      type: 'table',
      keys: [
        {name : 'accountkey', type : 'foreign_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key' , dataType: 'string'},
        {name : 'key_3', type : 'field', dataType: 'integer'},
        {name : 'key_4', type : 'field', dataType: 'double'}
      ]
    }
  }, {
    id: 'table_31',
    label: 'table_31',
    data: {
      type: 'table',
      keys: [
        {name : 'gsn', type : 'foreign_key' , dataType: 'number'},
        {name : 'cob_dt', type : 'foreign_key', dataType: 'number'},
        {name : 'key_5keykey', type : 'primary_key', dataType: 'string'},
        {name : 'key_5', type : 'field', dataType: 'double'}
      ]
    }
  },
  {
    id: 'dbm_mrd_btl2',
    label: 'dbm_mrd_btl2',
    data: {
      type: 'table',
      keys: [
        {name: 'productcode', dataType: 'number', type: 'foreign_key' },{name : 'accountkey', type : 'primary_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key', dataType: 'string'},
        {name : 'key_23', type : 'field', dataType: 'integer'},
        {name : 'key_1', type : 'field', dataType: 'double'},
        {name : 'key_2', type : 'field', dataType: 'string'},
        {name : 'key_23', type : 'field' , dataType: 'integer'}
      ]
    }
  }, {
    id: 'table_22',
    label: 'table_22',
    data: {
      type: 'table',
      keys: [
        {name : 'accountkey', type : 'foreign_key', dataType: 'number'},
        {name : 'reporting_month', type : 'foreign_key' , dataType: 'string'},
        {name : 'key_3', type : 'field', dataType: 'integer'},
        {name : 'key_4', type : 'field', dataType: 'double'}
      ]
    }
  }, {
    id: 'table_32',
    label: 'table_32',
    data: {
      type: 'table',
      keys: [
        {name : 'gsn', type : 'foreign_key' , dataType: 'number'},
        {name : 'cob_dt', type : 'foreign_key', dataType: 'number'},
        {name : 'key_5keykey', type : 'primary_key', dataType: 'string'},
        {name : 'key_5', type : 'field', dataType: 'double'}
      ]
    }
  }
];

export const clusters: ClusterNode[] = [
  {
    id: 'third',
    label: 'C',
    childNodeIds: ['c1', 'c2']
  }
];
export const links: Edge[] = [
  {
    id: 'a',
    source: 'dbm_mrd_btl',
    target: 'table_2',
    label: 'is parent of',
    data: {
      relationship: 'OneToOne',
      joinType : 'Left',
      masterkey: 'accountkey,reporting_month',
      slavekey: 'accountkey,reporting_month'
    }
  }, {
    id: 'b',
    source: 'dbm_mrd_btl',
    target: 'table_3',
    label: 'custom label',
    data: {
      relationship: 'ManyToMany',
      joinType : 'Left',
      masterkey: 'productcode,reporting_month',
      slavekey: 'gsn,cob_dt'
    }
  },
  {
    id: 'aa',
    source: 'dbm_mrd_btl1',
    target: 'table_21',
    label: 'is parent of',
    data: {
      relationship: 'OneToOne',
      joinType : 'Left',
      masterkey: 'accountkey,reporting_month',
      slavekey: 'accountkey,reporting_month'
    }
  }, {
    id: 'bb',
    source: 'dbm_mrd_btl1',
    target: 'table_31',
    label: 'custom label',
    data: {
      relationship: 'ManyToMany',
      joinType : 'Left',
      masterkey: 'productcode,reporting_month',
      slavekey: 'gsn,cob_dt'
    }
  },
  {
    id: 'aaa',
    source: 'dbm_mrd_btl2',
    target: 'table_22',
    label: 'is parent of',
    data: {
      relationship: 'OneToOne',
      joinType : 'Left',
      masterkey: 'accountkey,reporting_month',
      slavekey: 'accountkey,reporting_month'
    }
  }, {
    id: 'bbb',
    source: 'dbm_mrd_btl2',
    target: 'table_32',
    label: 'custom label',
    data: {
      relationship: 'ManyToMany',
      joinType : 'Left',
      masterkey: 'productcode,reporting_month',
      slavekey: 'gsn,cob_dt'
    }
  }
];
