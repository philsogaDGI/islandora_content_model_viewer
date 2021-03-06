Ext.onReady(function(){
  Ext.define('ContentModelViewer.widgets.FilesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.filespanel',
    config: {
      pid: 'required'
    },
    constructor: function(config) {
      this.callParent(arguments);
      this.collapsed = true;
      var properties = ContentModelViewer.properties;
      var url = properties.url;
      var store = this.store = Ext.create('Ext.data.Store', {
        model: ContentModelViewer.models.Datastream,
        autoLoad: true,
        pageSize: 4,
        proxy: {
          type: 'rest',
          url : url.object.datastreams(config.pid),
          extraParams: {
            filter: true
          },
          reader: {
            type: 'json',
            root: 'data',
            totalProperty: 'total'
          }
        },
        listeners: {
          load: (config.onLoad) ? config.onLoad : function() {}
        }
      });
      var datastreams = Ext.create('Ext.view.View', {
        itemId: 'datastreams',
        itemSelector: 'div.file-item',
        emptyText: 'No Files Available',
        deferEmptyText: false,
        itemTpl: new Ext.XTemplate(
          '<tpl for=".">',
          '   <div class="file-item">',
          '       <div class="file-item-dsid">{[fm.ellipsis(values.dsid, 30, true)]}</div>',
          '       <img class="file-item-img file-item-show-view" src="{tn}"></img>',
          '       <tpl if="this.showLabel(label)">',
          '           <div class="file-item-label">{[fm.ellipsis(values.label, 30, true)]}</div>',
          '       </tpl>',
          '   </div>',
          '</tpl>',
          {
            compiled: true,
            disableFormats: true,
            showLabel: function(label) {
              return jQuery.trim(label) != '';
            }
          }),
        store: store,
        listeners: {
          selectionchange: function(view, selections, options) {
            var filesPanel = this.findParentByType('filespanel');
            var toolbar = filesPanel.getComponent('toolbar');
            var button, record = selections[0];
            if(record) {
              button = toolbar.getComponent('view');
              record.get('view') ? button.enable() : button.disable();
              button = toolbar.getComponent('download');
              record.get('download') ? button.enable() : button.disable();
            }
          } 
        }    
      });
      var toolbar = Ext.create('Ext.toolbar.Toolbar', {
        dock: 'top',
        itemId: 'toolbar',
        items: [{
          xtype: 'button',
          text: 'View',
          itemId: 'view',
          cls: 'x-btn-text-icon',
          iconCls: 'view-datastream-icon',
          disabled: true,
          handler : function() {
            var filesPanel = this.findParentByType('filespanel');
            var record = filesPanel.getSelected();
            if(record) {
              var dsid = record.get('view'), func = record.get('view_function');
              Ext.getCmp('datastream-viewer').view(filesPanel.pid, dsid, func);
            }
          }
        }, {
          xtype: 'button',
          text: 'Download',
          cls: 'x-btn-text-icon',
          iconCls: 'download-datastream-icon',
          itemId: 'download',
          disabled: true,
          handler : function() {
            var filesPanel = this.findParentByType('filespanel');
            var record = filesPanel.getSelected();
            if(record) {
              ContentModelViewer.functions.downloadDatastream(filesPanel.pid, record.get('dsid'));
            }
          }
        }]
      });
      var pager = Ext.create('Ext.toolbar.Paging', {
        dock: 'bottom',
        itemId: 'pager',
        xtype: 'pagingtoolbar',
        store: store
      });
      this.add(datastreams);
      this.addDocked(toolbar);
      this.addDocked(pager);
    },
    setPid: function(pid) {
      var properties = ContentModelViewer.properties;
      var url = properties.url;
      this.pid = pid;
      this.store.setProxy({
        type: 'rest',
        url : url.object.datastreams(pid),
        extraParams: {
          filter: true
        },
        reader: {
          type: 'json',
          root: 'data',
          totalProperty: 'total'
        }
      });
      var pager = this.getComponent('pager');
      pager.doRefresh();
    //this.store.load();
    },
    getSelected: function() {
      var datastreams = this.getComponent('datastreams');
      var selectionModel = datastreams.getSelectionModel();
      if(selectionModel.hasSelection()) {
        return selectionModel.selected.first();
      }
      return null;
    },
    title: 'Files',
    itemId: 'files',
    width: 260,
    collapsible: true,
    split: true
  });
});