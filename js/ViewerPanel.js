Ext.onReady(function(){
  Ext.define('ContentModelViewer.widgets.ViewerPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.viewerpanel',
    config: {
      pid: 'required',
      dsid: 'optional',
      viewFunction: 'optional'
    },
    constructor: function(config) {
      this.callParent(arguments);
      var viewer = Ext.create('ContentModelViewer.widgets.DatastreamViewerPanel', {
        region: 'center',
        pid: config.pid,
        dsid: config.dsid,
        viewFunction: config.viewFunction
      });
      var files = Ext.create('ContentModelViewer.widgets.FilesPanel', {
        region: 'east',
        pid: config.pid,
        onLoad: this.onLoad
      });
      this.add(viewer);
      this.add(files);
    },
    title: 'Viewer',
    id: 'viewerpanel',
    itemId: 'viewer',
    layout: {
      type: 'border'
    },
    setPid: function(pid) {
      this.pid = pid;
      var files = this.getComponent('files');
      files.setPid(pid);
    },
    onLoad: function(store, records, successful, operation, eOpts) {
      for(var i = 0; i < records.length; i++) {
        var record = records[i];
        if(record.get('default')) {
          var pid = Ext.getCmp('viewerpanel').pid;
          var dsid = record.get('dsid');
          var viewFunction = record.get('view_function');
          Ext.getCmp('datastream-viewer').view(pid, dsid, viewFunction);
          return;
        }
      }
      Ext.getCmp('datastream-viewer').update('No Viewer Avaliable');
    }
  });
});
