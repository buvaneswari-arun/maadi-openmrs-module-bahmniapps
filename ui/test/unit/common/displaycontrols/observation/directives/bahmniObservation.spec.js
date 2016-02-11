'use strict';

describe("BahmniObservation", function () {
    var appService, scope, $compile, mockBackend, observationsService, visitFormService, q, spinner;
    var simpleHtml = '<bahmni-observation section="section" patient="patient" is-on-dashboard="true" config="config" enrollment="enrollment"></bahmni-observation>';

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('bahmni.common.displaycontrol.observation', function ($provide) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch', 'fetchForEncounter']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return {
                    concept: ""
                }
            }, getExtensions: function (a, b) {
                return {
                    maxPatientsPerBed: 2
                }
            },
            getConfig: function(){

            }
        });
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);

        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });

        $provide.value('observationsService', observationsService);
        $provide.value('appService', appService);
        $provide.value('spinner', spinner);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $q) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        q = $q;
        mockBackend = $httpBackend;
    }));

    describe("Initialization", function () {
        it("should fetch observations for encounter if the encounterUuid is provided", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, encounterUuid: "encounterUuid", conceptNames: ["Concept Name"]};
            scope.section = {};
            observationsService.fetchForEncounter.and.returnValue({});

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetchForEncounter).toHaveBeenCalledWith(scope.config.encounterUuid, scope.config.conceptNames);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(1);
            expect(observationsService.fetch.calls.count()).toEqual(0);
        });

        it("should fetch observations for patient if the encounterUuid is not provided", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, conceptNames: ["Concept Name"], scope: "latest", numberOfVisits: 1};
            scope.section = {startDate: "enrollment date" , endDate: "completed date"};
            scope.enrollment = "uuid";
            observationsService.fetch.and.returnValue({});

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetch).toHaveBeenCalledWith(scope.patient.uuid, scope.config.conceptNames, scope.config.scope,
                scope.config.numberOfVisits, undefined, undefined, null, "enrollment date", "completed date", "uuid");
            expect(observationsService.fetch.calls.count()).toEqual(1);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
        });

        it("should fetch observations within daterange if you want to fetch program specific data.", function () {
            scope.patient = {uuid: '123'};
            scope.config = {showGroupDateTime: false, conceptNames: ["Concept Name"], scope: "latest", numberOfVisits: 1};
            scope.section = {startDate: "enrollment date", endDate: "completed date"};
            scope.enrollment = "uuid";
            observationsService.fetch.and.returnValue({});
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return {
                        showDetailsWithinDateRange: true
                    }
                }, getExtensions: function (a, b) {
                    return {
                        maxPatientsPerBed: 2
                    }
                },
                getConfig: function(){

                }
            });

            mockBackend.expectGET('../common/displaycontrols/observation/views/observationDisplayControl.html').respond("<div>dummy</div>");

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.config).not.toBeUndefined();
            expect(observationsService.fetch).toHaveBeenCalledWith(scope.patient.uuid, scope.config.conceptNames,
                scope.config.scope, scope.config.numberOfVisits, undefined, undefined,
                null, "enrollment date", "completed date", "uuid");
            expect(observationsService.fetch.calls.count()).toEqual(1);
            expect(observationsService.fetchForEncounter.calls.count()).toEqual(0);
        })
    });
});