(function(){
    jQuery("#new_rm_detail_sc_zzfcard\\.date_checkin").addClass("shortField");
    jQuery("#new_rm_detail_sc_zzfcard\\.date_first_pay").addClass("shortField");
    jQuery("#used_rm_detail_sc_zzfcard\\.date_payrent_last").addClass("shortField");
})()


var zzfOutsiderController = View.createController('zzfOutsiderController', {

    afterViewLoad: function(){
        this.site_tree.addParameter('rmType', " rm_type in ('30401','30402','30403','30404')");
        this.treePrDS.addParameter('rmType', " rm_type in ('30401','30402','30403','30404')");
        this.treeBlDS.addParameter('rmType', " rm_type in ('30401','30402','30403','30404')");
        this.treeFlDS.addParameter('rmType', " rm_type in ('30401','30402','30403','30404')");
        this.treeRmDS.addParameter('rmType', " rm_type in ('30401','30402','30403','30404')");
        document.getElementById("require_reply").checked = false;
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').hide();
    },
    setNewRoomdates: function(){
        var today = new Date();
        var startDay = monthStartDate(today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkin', today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
    },
    
    applicant_info_afterRefresh: function(){
        this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'CCSQ');
    },
    
    site_tree_afterRefresh: function(){
        this.applicant_info.refresh(null, true);
        this.new_rm_detail.refresh(null, true);
		this.used_rm_detail.refresh(null,true);
        this.rm_detail.refresh(null, true);
        this.rm_detail.setFieldValue('rm.fl_id', '');
        jQuery('#checkout').attr('value', '');
        jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
        this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
        this.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
        this.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
        this.setNewRoomdates();
    },
    
    applicant_info_onClear: function(){
        this.site_tree_afterRefresh();
        this.site_tree.refresh();
    },
    
    changeYear: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var inputYear = jQuery('#checkout').val();
        if (isNaN(inputYear)) {
            View.showMessage('请输入数字');
            jQuery('#checkout').attr('value', '');
            return;
        }
        if (inputYear) {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var startDay = monthStartStr(dateCheckin);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    
    showHistory: function(){
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        //验证身份证号输入是否合法
        var idValidate = IdCardValidate(identity);
        if (!idValidate) {
            View.showMessage('输入身份证无效，请重新输入');
            this.applicant_info.setFieldValue('sc_zzfcard.identi_code', '');
        }
        //确定租赁类型
        var res = new Ab.view.Restriction();
        var term = ['yrz', 'yxq', 'ytz'];
        res.addClause('sc_zzfcard.identi_code', identity, '=');
        res.addClause('sc_zzfcard.card_status', term, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res);
        if (records.length > 0) {
            this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'ZLTZ');
        }
        else {
            this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'CCSQ');
        }
        //如果申请人拥有两套或以上住房，不能登记
        var res1 = new Ab.view.Restriction();
        var term1 = ['yrz', 'yxq'];
        res1.addClause('sc_zzfcard.identi_code', identity, '=');
        res1.addClause('sc_zzfcard.card_status', term1, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res1);
        if (records.length > 1) {
            View.showMessage("申请过多住房");
            this.applicant_info.actions.get('save').enable(false);
        }else{
			this.applicant_info.actions.get('save').enable(true);
		}
        //刷新正在使用的房间信息
        var lastDate = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        lastDate = getPrevMonthLastDay(new Date(lastDate));
        var res2 = new Ab.view.Restriction();
        res2.addClause('sc_zzfcard.identi_code', identity, '=');
        res2.addClause('sc_zzfcard.card_status', term1, 'IN');
        var records = this.sc_zzfcardDataSource.getRecords(res2);
        if (records.length > 0) {
            this.used_rm_detail.refresh(res2, false);
            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
            this.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
        }
        else {
            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
            this.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', false);
            this.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
            this.used_rm_detail.enableField('sc_zzfcard.ttqx', false);
        }
    },
    
    paymentChange: function(){
        var paymentTo = this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to');
        if (paymentTo == 'finance') {
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    
    onClickRmNode: function(){
        var currentNode = this.site_tree.lastNodeClicked;
        var blId = currentNode.data['rm.bl_id'];
        var flId = currentNode.data['rm.fl_id'];
        var rmId = currentNode.data['rm.rm_id'];
        res1 = new Ab.view.Restriction();
        res1.addClause('rm.bl_id', blId);
        res1.addClause('rm.fl_id', flId);
        res1.addClause('rm.rm_id', rmId);
        this.rm_detail.refresh(res1, false);
        var area_comn_rm = this.rm_detail.getFieldValue('rm.area_comn_rm');
        this.new_rm_detail.setFieldValue('sc_zzfcard.area_lease', area_comn_rm);
        this.new_rm_detail.show();
    },
    
    applicant_info_onSave: function(){
    	var uuid;
    	var result;
    	//生成guid
        try {
    			result = Workflow.callMethod('AbSpaceRoomInventoryBAR-GetMyGUID-getMyGUID');
            } catch (e) {
        	Workflow.handleError(e);
         	}	
            if (result.code == 'executed') {
            	var a;
                //var id = eval('(' + result.jsonExpression + ')');
                var temp = result.jsonExpression.toString().split(":")[1];
                uuid = temp.substring(0,temp.length-2);
                //uuid = id[0].GUID
            }
            this.applicant_info.setFieldValue("sc_zzfcard.uuid",uuid);
        //未选房间提醒
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间');
            return;
        }
        var inputYear = jQuery('#checkout').val();
        if (inputYear == '') {
            View.showMessage('请输入合同期限');
            return;
        }
      //未填入住日期提醒
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        if (!dateCheckin) {
            View.showMessage('入住日期是必须的');
            return;
        }
		var area = this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease');
        if (parseFloat(area) == 0) {
            View.showMessage('协议面积是必须的且不能为0');
            return;
        }
        //选择别人代缴却没有填写代缴人提醒
        var checked = document.getElementById("require_reply").checked;
        var daijiaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.djfr');
        var danbaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.sponsor_name');
        if (checked == true) {
            if (daijiaoren == '' || danbaoren == '') {
                View.showMessage('请选择代缴人');
                return;
            }
        }
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        //修改未腾退房间协议信息
        var res = new Ab.view.Restriction();
        var term = ['yrz', 'yxq'];
        res.addClause('sc_zzfcard.identi_code', identity, '=');
        res.addClause('sc_zzfcard.card_status', term, 'IN');
        var record = this.sc_zzfcardDataSource.getRecord(res);
        if (record != '') {
            var dateLast = this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last');
            var ttqx = this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx');
            if (!dateLast || !ttqx) {
                View.showMessage('请填写停缴时间和腾退期限');
                return;
            }
            record.setValue('sc_zzfcard.date_payrent_last', this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last'));
            record.setValue('sc_zzfcard.ttqx', this.used_rm_detail.getFieldValue('sc_zzfcard.ttqx'));
            this.sc_zzfcardDataSource.saveRecord(record);
        }
        
        //存入新的房间协议
        this.applicant_info.save();
        
       //通过guid 查找card_id
        var res = new Ab.view.Restriction();
        res.addClause("sc_zzfcard.uuid",uuid,"=");
        var record=this.sc_zzfcardDataSource.getRecord(res);
        var cardId = record.getValue("sc_zzfcard.card_id");
        this.applicant_info.setFieldValue("sc_zzfcard.card_id",cardId);
       //获取登记信息
        var dateBegin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var dateEnd = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        var period = this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period');
        var price = this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate');
        var otherPrice = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        var blId = this.rm_detail.getFieldValue('rm.bl_id');
        var flId = this.rm_detail.getFieldValue('rm.fl_id');
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        var inputYear = jQuery('#checkout').val();
        var htqx = '';
        if (inputYear != '') {
            htqx = inputYear + '年';
        }
        var res1 = new Ab.view.Restriction();
        res1.addClause('sc_zzfcard.card_id', cardId);
        var record1 = this.sc_zzfcardDataSource.getRecord(res1);
        record1.setValue('sc_zzfcard.bl_id', blId);
        record1.setValue('sc_zzfcard.fl_id', flId);
        record1.setValue('sc_zzfcard.rm_id', rmId);
        record1.setValue('sc_zzfcard.area_manual', this.rm_detail.getFieldValue('rm.area_manual'));
        record1.setValue('sc_zzfcard.area_yangtai', this.rm_detail.getFieldValue('rm.area_yangtai'));
        record1.setValue('sc_zzfcard.gl_area', this.rm_detail.getFieldValue('rm.gl_area'));
        record1.setValue('sc_zzfcard.huxing', this.rm_detail.getFieldValue('rm.huxing'));
        record1.setValue('sc_zzfcard.site_id', this.rm_detail.getFieldValue('bl.site_id'));
        record1.setValue('sc_zzfcard.pr_id', this.rm_detail.getFieldValue('bl.pr_id'));
        record1.setValue('sc_zzfcard.rm_type', this.rm_detail.getFieldValue('rm.rm_type'));
        record1.setValue('sc_zzfcard.date_checkin', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin'));
        record1.setValue('sc_zzfcard.date_checkout_ought', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record1.setValue('sc_zzfcard.date_checkout_ought_first', this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought'));
        record1.setValue('sc_zzfcard.date_first_pay', this.new_rm_detail.getFieldValue('sc_zzfcard.date_first_pay'));
        record1.setValue('sc_zzfcard.payment_to', this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to'));
        record1.setValue('sc_zzfcard.rent_period', this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period'));
        record1.setValue('sc_zzfcard.cash_deposit', this.new_rm_detail.getFieldValue('sc_zzfcard.cash_deposit'));
        record1.setValue('sc_zzfcard.curr_rent_rate', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record1.setValue('sc_zzfcard.price_lately', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record1.setValue('sc_zzfcard.area_lease', this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease'));
        record1.setValue('sc_zzfcard.other_rent', this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent'));
        record1.setValue('sc_zzfcard.card_status', 'yrz');
        record1.setValue('sc_zzfcard.card_type', '1');
        record1.setValue('sc_zzfcard.htqx', htqx);
        this.sc_zzfcardDataSource.saveRecord(record1);
        
        //更新房间的可租赁资源数
        var res2 = new Ab.view.Restriction();
        res2.addClause('rm.bl_id', blId);
        res2.addClause('rm.fl_id', flId);
        res2.addClause('rm.rm_id', rmId);
        var record2 = this.rm_detail.getRecord(res2);
        var source = parseInt(record2.getValue('rm.yzlzys'),10);
        this.rm_detail.setFieldValue('rm.yzlzys',source +1);
         var rmDetail =  this.rm_detail;
         this.rm_detail.save();
        
        //更新未腾退房间字段
        if (this.used_rm_detail.getFieldValue('sc_zzfcard.bl_id')) {
            var res3 = new Ab.view.Restriction();
            var cardIdTengtui = this.used_rm_detail.getFieldValue('sc_zzfcard.card_id');
            res3.addClause('sc_zzfcard.card_id', cardIdTengtui);
            var record3 = this.sc_zzfcardDataSource.getRecord(res3);
            record3.setValue('sc_zzfcard.card_id', 'ttz');
            this.sc_zzfcardDataSource.saveRecord(record3);
        }
        
        try {
            var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfRent-othersPaymentHandle', dateBegin, dateEnd, period, parseFloat(price),parseFloat(otherPrice),cardId, parseFloat(area));
        } 
        catch (e) {
            Workflow.handleError(e);
        }
		View.showMessage('保存成功');
        this.applicant_info.actions.get('save').enable(false);
    },
    
    new_rm_detail_onUploadFile: function(){
        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        if (cardId != '') {
            var restriction = new Ab.view.Restriction();
            restriction.addClause("sc_zzfcard.card_id", cardId, '=');
            this.upload_file.refresh(restriction);
            this.upload_file.showInWindow({
                title: "附件上传",
                x: 800,
                y: 200,
                width: 500,
                height: 260,
                closeButton: false
            });
        }
        else {
            View.showMessage("保存协议后再进行附件上传");
        }
    },
    
    selectDaikouPerson: function(){
        if (document.getElementById("require_reply").checked) {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').show();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').show();
            this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'finance');
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.sponsor_name_labelCell').hide();
            this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'house');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    }
});
