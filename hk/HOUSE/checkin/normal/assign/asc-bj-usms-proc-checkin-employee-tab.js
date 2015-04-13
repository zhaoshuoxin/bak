(function(){
    jQuery("#new_rm_detail_sc_zzfcard\\.date_checkin").addClass("shortField");
	jQuery("#new_rm_detail_sc_zzfcard\\.date_first_pay").addClass("shortField");
    jQuery("#used_rm_detail_sc_zzfcard\\.date_payrent_last").addClass("shortField");
})()


var area1;

var zzfEmpoyeeController = View.createController('zzfEmpoyeeController', {

    tabs: null,
//    cardId: null,
    
    afterViewLoad: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.cardId = this.tabs.cardId;
        this.site_tree.addParameter('rmType', " rm_type = '30401'");
        this.treePrDS.addParameter('rmType', " rm_type = '30401'");
        this.treeBlDS.addParameter('rmType', " rm_type = '30401'");
        this.treeFlDS.addParameter('rmType', " rm_type = '30401'");
        this.treeRmDS.addParameter('rmType', " rm_type = '30401'");
//		document.getElementById("require_reply").checked = false;
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
        jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
    },
    
    site_tree_afterRefresh: function(){
        this.applicant_info.refresh(null, true);
        this.new_rm_detail.refresh(null, true);
        this.rm_detail.refresh(null, true);
        this.rm_detail.setFieldValue('rm.fl_id', '');
        jQuery('#checkout').attr('value', '');
        jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        this.setNewRoomdates();
    },
    applicant_info_onClear: function(){
        this.site_tree_afterRefresh();
        this.site_tree.refresh();
        this.used_rm_detail.refresh('1<>1');
    },
    changePaymentTo: function(){
        var payment = this.new_rm_detail.getFieldValue('sc_zzfcard.payment_to');
        if (payment == 'finance') {
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    },
    
    setNewRoomdates: function(){
        var today = new Date();
        var startDay = monthStartDate(today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkin', today);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
    //    dateCheckin = new Date(dateCheckin);
        var dateCheckout = nYearsLaterSameDay(dateCheckin, '1');
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
    },
    changeYear: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var inputYear = jQuery('#checkout').val();
        if (inputYear > 5){
        	View.showMessage('合同期限不得超过5年');
        }
        var type = jQuery('#selectType').val();
        var dateCheckout = '';
        if (isNaN(inputYear)) {
            View.showMessage('请输入数字');
            jQuery('#checkout').attr('value', '');
            return;
        }
        if (inputYear != '') {
            if (type == 'year') {
                dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            }
            else 
                if (type == 'month') {
                    dateCheckout = nMonthLater(dateCheckin, inputYear);
                }
                else {
                    dateCheckout = nDaysLater(dateCheckin, inputYear);
                }
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    changeSelectType: function(){
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        //dateCheckin = new Date(dateCheckin);
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var dateCheckout = '';
        if (inputYear != '') {
            if (type == 'year') {
                dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            }
            else 
                if (type == 'month') {
                    dateCheckout = nMonthLater(dateCheckin, inputYear);
                }
                else {
                    dateCheckout = nDaysLater(dateCheckin, inputYear);
                }
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
    },
    changeCheckin: function(){
        var inputYear = jQuery('#checkout').val();
      
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        var emId = this.applicant_info.getFieldValue('sc_zzfcard.em_id');
        if (dateCheckin) {
            var dateTotalUse = getTotalTime(identity, dateCheckin);
            this.applicant_info.setFieldValue('sc_zzfcard.total_rent_all', dateTotalUse);
        }
    //    dateCheckin = new Date(dateCheckin);
        var startDay = monthStartStr(dateCheckin);
        this.new_rm_detail.setFieldValue('sc_zzfcard.date_first_pay', startDay);
        if (this.used_rm_detail.getFieldValue('sc_zzfcard.date_payrent_last')) {
            lastDate = getPrevMonthLastDay(new Date(dateCheckin));
            this.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
        }
        if (inputYear != '') {
            var dateCheckout = nYearsLaterSameDay(dateCheckin, inputYear);
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', dateCheckout);
        }
        else {
            this.new_rm_detail.setFieldValue('sc_zzfcard.date_checkout_ought', '');
        }
//      this.calcActionRent();
    },
    
    calcActionRent: function(){
        var dateLimit = "2012-07-01";
        var totalRentMonth = this.applicant_info.getFieldValue('sc_zzfcard.total_rent_all');
        var dateComein = this.applicant_info.getFieldValue('sc_zzfcard.date_work_begin');
        var checkinTime = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        checkinTime1 = new Date(checkinTime);
        var checkoutOught = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        checkoutOught1 = new Date(checkoutOught);
        if (!dateCompare(dateComein, dateLimit)) {
            if (totalRentMonth == 0 || totalRentMonth == 12 || totalRentMonth == 24 || totalRentMonth >= 36) {
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', checkoutOught);
                if (totalRentMonth == 0) {
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '60');
                }
                else 
                    if (totalRentMonth == 12) {
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '70');
                    }
                    else 
                        if (totalRentMonth == 24) {
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '80');
                        }
                        else 
                            if (totalRentMonth >= 36) {
                                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', '100');
                            }
            }
            else {
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', getOneEndDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_begin', getTwoBeginDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_end', checkoutOught);
                if (totalRentMonth > 0 && totalRentMonth <= 12) {
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 60);
                    this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 70);
                }
                else 
                    if (totalRentMonth > 12 && totalRentMonth <= 24) {
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 70);
                        this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 80);
                    }
                    else 
                        if (totalRentMonth > 24 && totalRentMonth <= 36) {
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 80);
                            this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 100);
                        }
            }
        }
        else {
			//View.showMessage("员工于2012-7-1前入校，累计租住时间未满36个月时，使用成本租金计算房租，超过36个月时，使用市场租金计算房租");
            if (totalRentMonth == 0 || totalRentMonth == 12 || totalRentMonth == 24 || totalRentMonth >= 36) {
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', checkoutOught);
            }
            else {
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_one', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.rate_two', 100);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_begin', checkinTime);
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_one_end', getOneEndDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_begin', getTwoBeginDate(checkinTime, totalRentMonth));
                this.new_rm_detail.setFieldValue('sc_zzfcard.date_two_end', checkoutOught);
            }
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
    	
        var identity = this.applicant_info.getFieldValue('sc_zzfcard.identi_code');
        var resIdentity = new Ab.view.Restriction();
        resIdentity.addClause('sc_zzfcard.identi_code', identity, '=');
        var records = this.sc_zzfcardDataSource.getRecords(resIdentity);
        if (records.length == eval(2) || records.length>eval(2)) {
        	View.showMessage("每位职工只能申请两套");
        	return;
        }
    	//生成guid
        try {
    		var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-GetMyGUID-getMyGUID');
            } catch (e) {
        	Workflow.handleError(e);
         	}	
            if (result.code == 'executed') {
            	var a;
                //var id = eval('(' + result.jsonExpression + ')');
                var temp = result.jsonExpression.toString().split(":")[1];
                var uuid = temp.substring(0,temp.length-2);
                //uuid = id[0].GUID
            }
            this.applicant_info.setFieldValue("sc_zzfcard.uuid",uuid);
       
		//未选房间提醒
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        if (rmId == '') {
            View.showMessage('请选择房间');
            return;
        }
       
		//未填入住日期提醒
        var dateCheckin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        if (!dateCheckin) {
            View.showMessage('入住日期是必须的');
            return;
        }
        var inputYear = jQuery('#checkout').val();
        var type = jQuery('#selectType').val();
        var htqx = '';
        if (inputYear == '') {
            View.showMessage('请输入合同期限');
            return;
        }
        else {
            if (type == 'year') {
                htqx = inputYear + '年';
            }
            else 
                if (type == 'month') {
                    htqx = inputYear + '月';
                }
        }
		var area = this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease');
        if (parseFloat(area) == 0) {
            View.showMessage('协议面积是必须的且不能为0');
            return;
        }
       
        //其他费用验证
        var otherPrice1 = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        if(!valueExistsNotEmpty(otherPrice1)){
        	View.showMessage('请填写其它费用');
        	return;
        }
        
        var uuid = this.applicant_info.getFieldValue('sc_zzfcard.uuid');
		//选择别人代缴却没有填写代缴人的提醒
//		var checked = document.getElementById("require_reply").checked;
//		var daijiaoren = this.new_rm_detail.getFieldValue('sc_zzfcard.djfr');
//		if(checked==true && daijiaoren==''){
//			View.showMessage('请选择代缴人');
//            return;
//		}
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
            record.setValue('sc_zzfcard.card_status','ttz');
            this.sc_zzfcardDataSource.saveRecord(record);
        }
        
      	 //存入新的房间协议
        area1 = this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease');
        var otherPrice = this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent');
        
        this.applicant_info.save();
        
        //通过guid 查找card_id
        var res = new Ab.view.Restriction();
        res.addClause("sc_zzfcard.uuid",uuid,"=");
        var record=this.sc_zzfcardDataSource.getRecord(res);
        var cardId = record.getValue("sc_zzfcard.card_id");
        this.applicant_info.setFieldValue("sc_zzfcard.card_id",cardId);
        //获取登记信息
//        var inputYear = jQuery('#checkout').val();
//        var htqx = '';
//        if (inputYear != '') {
//            htqx = inputYear + '年';
//        }
//        var cardId = this.applicant_info.getFieldValue('sc_zzfcard.card_id');
        var blId = this.rm_detail.getFieldValue('rm.bl_id');
        var flId = this.rm_detail.getFieldValue('rm.fl_id');
        var rmId = this.rm_detail.getFieldValue('rm.rm_id');
        var res1 = new Ab.view.Restriction();
        res1.addClause('sc_zzfcard.card_id', cardId);
        var record1 = this.sc_zzfcardDataSource.getRecord(res1);
        record1.setValue('sc_zzfcard.total_rent_all', this.applicant_info.getFieldValue('sc_zzfcard.total_rent_all'));
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
        record1.setValue('sc_zzfcard.area_lease', this.new_rm_detail.getFieldValue('sc_zzfcard.area_lease'));
        record1.setValue('sc_zzfcard.djfr', this.new_rm_detail.getFieldValue('sc_zzfcard.djfr'));
        record1.setValue('sc_zzfcard.curr_rent_rate', this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate'));
        record1.setValue('sc_zzfcard.other_rent', this.new_rm_detail.getFieldValue('sc_zzfcard.other_rent'));
        record1.setValue('sc_zzfcard.card_status', 'yrz');
        record1.setValue('sc_zzfcard.card_type', '0');
        record1.setValue('sc_zzfcard.htqx', htqx);
        record1.setValue('sc_zzfcard.em_name',this.applicant_info.getFieldValue('sc_zzfcard.em_name'));
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
            record3.setValue('sc_zzfcard.card_status', 'ttz');
            this.sc_zzfcardDataSource.saveRecord(record3);
        }
        
        //生成缴费项
        var dateBegin = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
        var period = this.new_rm_detail.getFieldValue('sc_zzfcard.rent_period');
        var dateEnd = this.new_rm_detail.getFieldValue('sc_zzfcard.date_checkout_ought');
        var price = this.new_rm_detail.getFieldValue('sc_zzfcard.curr_rent_rate');
        try {
        	var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-CalcZzfEmRent-othersPaymentHandle', dateBegin, dateEnd, period, parseFloat(price),parseFloat(otherPrice),cardId, parseFloat(area1));
        } 
        catch (e) {
            Workflow.handleError(e);
        }
		View.showMessage('保存成功');
        
        this.site_tree.refresh();
     
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
			this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'finance');
            this.new_rm_detail.setFieldValue('sc_zzfcard.rent_period', 'Month');
            jQuery('#new_rm_detail_sc_zzfcard\\.payment_to').attr('disabled', 'disabled');
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', 'disabled');
        }
        else {
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr').hide();
            jQuery('#new_rm_detail_sc_zzfcard\\.djfr_labelCell').hide();
			this.new_rm_detail.setFieldValue('sc_zzfcard.payment_to', 'house');
			jQuery('#new_rm_detail_sc_zzfcard\\.payment_to').attr('disabled', false);
            jQuery('#new_rm_detail_sc_zzfcard\\.rent_period').attr('disabled', false);
        }
    }
});

function getEmCheckinDate(identity){
    var parameters = {
        tableName: 'sc_zzfcard',
        fieldNames: toJSON(['sc_zzfcard.date_checkin']),
        restriction: "sc_zzfcard.identi_code ='" + identity + "' and sc_zzfcard.card_status in ('yrz','yxq','ytz') "
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    //var dataList = [];
    if (result.data.records.length > 0) {
        var dateOutput = result.data.records[0]['sc_zzfcard.date_checkin'];
        for (var i = 0; i < result.data.records.length; i++) {
            var dateCheckin = result.data.records[i]['sc_zzfcard.date_checkin'];
            if (dateOutput > dateCheckin) {
                dateOutput = dateCheckin;
            }
        }
        return dateOutput;
    }
    else {
        return '';
    }
}

function getTotalTime(identity, lastDate){
    var parameters = {
        tableName: 'sc_zzfcard',
        fieldNames: toJSON(['sc_zzfcard.date_checkin', 'sc_zzfcard.date_checkout_actual', 'card_status']),
        restriction: "sc_zzfcard.identi_code ='" + identity + "' and sc_zzfcard.card_status in ('yrz','yxq','ytz')"
    };
    
    var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    var dataList = [];
    if (result.data.records.length > 0) {
        var totalTime = 0;
        for (var i = 0; i < result.data.records.length; i++) {
            var record = result.data.records[i];
            var dateCheckIn = record['sc_zzfcard.date_checkin'];
            var dateCheckoutActual = record['sc_zzfcard.date_checkout_actual'];
            if (record['sc_zzfcard.card_status'] == '已退租') {
                totalTime += getTotalMonth(dateCheckIn, dateCheckoutActual);
            }
            else {
                totalTime += getTotalMonth(dateCheckIn, lastDate);
            }
        }
        return totalTime;
    }
    else {
        return 0;
    }
}

function getOneEndDate(date, n){
    var month = 12 - n % 12;
    dateOutPut = nMonthLater(date, month);
    var later = ieDateFormat(dateOutPut);
    var datea = new Date(later);
    return dateOutPut = getPrevMonthLastDay(datea);
}

function getTwoBeginDate(date, n){
    var month = 12 - n % 12;
    dateOutPut = nMonthLater(date, month);
    var later = ieDateFormat(dateOutPut);
    return dateOutPut = monthStartDate(new Date(later));
}

function showHistory(selectedValue){
//	 var identity = zzfEmpoyeeController.applicant_info.getFieldValue('sc_zzfcard.identi_code');
	var identity = selectedValue;
    //验证身份证号输入是否合法
//    var idValidate = IdCardValidate(identity);
//    if (!identity) {
//        View.showMessage('输入身份证无效，请重新输入');
//        zzfEmpoyeeController.applicant_info.setFieldValue('sc_zzfcard.identi_code', '');
//    }
    //确定租赁类型
//    var res = new Ab.view.Restriction();
//    var term = ['yrz', 'yxq', 'ytz'];
//    res.addClause('sc_zzfcard.identi_code', identity, '=');
//    res.addClause('sc_zzfcard.card_status', term, 'IN');
//    var records = this.sc_zzfcardDataSource.getRecords(res);
//    if (records.length > 0) {
//        this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'ZLTZ');
//    }
//    else {
//        this.applicant_info.setFieldValue('sc_zzfcard.rent_type', 'CCSQ');
//    }
    //如果申请人拥有两套或以上住房，不能登记
    var res1 = new Ab.view.Restriction();
    var term1 = ['yrz', 'yxq'];
    res1.addClause('sc_zzfcard.identi_code', identity, '=');
    res1.addClause('sc_zzfcard.card_status', term1, 'IN');
    zzfEmpoyeeController.used_rm_detail.refresh(res1);
    var records = zzfEmpoyeeController.sc_zzfcardDataSource.getRecords(res1);
    if (records.length > 1) {
        View.showMessage("申请过多住房");
        zzfEmpoyeeController.applicant_info.actions.get('save').enable(false);
    }else{
    	zzfEmpoyeeController.applicant_info.actions.get('save').enable(true);
	}
    //刷新正在使用的房间信息
    var lastDate = zzfEmpoyeeController.new_rm_detail.getFieldValue('sc_zzfcard.date_checkin');
    lastDate = getPrevMonthLastDay(new Date(lastDate));
    var res2 = new Ab.view.Restriction();
    res2.addClause('sc_zzfcard.identi_code', identity, '=');
    res2.addClause('sc_zzfcard.card_status', term1, 'IN');
    var records = zzfEmpoyeeController.sc_zzfcardDataSource.getRecords(res2);
    if (records.length > 0) {
    	zzfEmpoyeeController.used_rm_detail.refresh(res2, false);
    	zzfEmpoyeeController.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', true);
    	zzfEmpoyeeController.used_rm_detail.enableField('sc_zzfcard.ttqx', true);
    	zzfEmpoyeeController.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', lastDate);
    }
    else {
    	zzfEmpoyeeController.used_rm_detail.setFieldValue('sc_zzfcard.date_payrent_last', '');
    	zzfEmpoyeeController.used_rm_detail.enableField('sc_zzfcard.date_payrent_last', false);
    	zzfEmpoyeeController.used_rm_detail.setFieldValue('sc_zzfcard.ttqx', 0);
    	zzfEmpoyeeController.used_rm_detail.enableField('sc_zzfcard.ttqx', false);
    }
//   this.calcActionRent();
}

function showTTPanel(fieldName,selectedValue,previousValue){
	if(fieldName=='sc_zzfcard.identi_code'){
		zzfEmpoyeeController.applicant_info.setFieldValue("sc_zzfcard.identi_code",selectedValue);
		showHistory(selectedValue);
	}
}
