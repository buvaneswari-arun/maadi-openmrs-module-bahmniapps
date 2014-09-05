'use strict';

Bahmni.Clinical.DrugOrder = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var DrugOrder = function (drugOrderData) {
        angular.extend(this, drugOrderData);
    };

    DrugOrder.create = function (drugOrderData) {
        return new DrugOrder(drugOrderData);
    };

    DrugOrder.createFromUIObject = function (drugOrderData) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDosingInstructions = function(drugOrderData) {
            if (drugOrderData.frequencyType === 'variable') {
                var instructions = {};
                instructions.morningDose = drugOrderData.variableDosingType.morningDose;
                instructions.afternoonDose = drugOrderData.variableDosingType.afternoonDose;
                instructions.eveningDose = drugOrderData.variableDosingType.eveningDose;
                return JSON.stringify(instructions);
            }
        };
        var doseUnits = drugOrderData.frequencyType === "uniform" ? drugOrderData.uniformDosingType.doseUnits : drugOrderData.variableDosingType.doseUnits;

        var drugOrder = new DrugOrder({
                careSetting: "Outpatient",
                drug: {name:drugOrderData.drugName},
                orderType: "Drug Order",
                dosingInstructionType: drugOrderData.dosingInstructionType,
                dosingInstructions: {
                    dose: drugOrderData.uniformDosingType.dose,
                    doseUnits: doseUnits,
                    route: drugOrderData.route,
                    frequency: drugOrderData.uniformDosingType.frequency,
                    asNeeded: drugOrderData.asNeeded,
                    administrationInstructions: getDosingInstructions(drugOrderData),
                    quantity: drugOrderData.quantity,
                    quantityUnits: drugOrderData.quantityUnit,
                    numberOfRefills: 0},
                duration: drugOrderData.duration,
                durationUnits: drugOrderData.durationUnit.name,
                scheduledDate: dateUtil.parse(drugOrderData.scheduledDate),
                dateStopped: dateUtil.addDays(dateUtil.parse(drugOrderData.scheduledDate), drugOrderData.durationInDays),
                action: drugOrderData.action,
                instructions: drugOrderData.instructions
            }
        );
        return drugOrder;
    };

    DrugOrder.prototype = {
        isActiveOnDate: function (date) {
            return date >= DateUtil.getDate(this.effectiveStartDate) && date <= DateUtil.getDate(this.effectiveStopDate);
        },

        isActive: function () {
            return this.isActiveOnDate(DateUtil.today());
        },

        isFreeTextDosingType: function () {
            return this.dosingType === 'FreeTextDosingInstructions';
        }

    };

    return DrugOrder;
})();