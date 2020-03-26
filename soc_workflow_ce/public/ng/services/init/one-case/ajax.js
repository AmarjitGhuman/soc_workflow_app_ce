require('ui/modules').get('app/soc_workflow_ce', []).service('spInitOneCaseAjax', [
    '$http',
    'spCF',
    function ($http, spCF) {
        return function ($scope) {
            let href = $scope.currUrl || false;
            if (href && $scope.currCaseId) {
                $('.cd-main-content').waitAnimationStart();
                $http({
                    method: "GET",
                    url: href + '/cases-one-entity',
                    dataType: "json",
                    params: {
                        id: $scope.currCaseId
                    }
                }).then(function successCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    response = response.data || {};
                    if (response.success && response.success == true) {
                        $scope.allStages = response['allStages'] || [];
                        $scope.userList = response['userList'] || [];
                        $scope.savedSearches = response['savedSearches'] || {};
                        $scope.graphWorkspace = response['graphWorkspace'] || {};
                        $scope.caseDataAction = response['dataAction'] || [];
                        $scope.caseRawData = response['data'] || {};
                        $scope.caseStageLog = response['stageLog'] || [];
                        $scope.caseAvailableStage = response['availableStage'] || [];
                        $scope.caseEnabledFieldList = response['caseEnabledFieldList'] || [];

                        if (!spCF.isString($scope.caseRawData.id)) {
                            window.location.href = $scope.casesUrl;
                        }
                    }
                }, function errorCallback(response) {
                    $('.cd-main-content').waitAnimationStop();
                    console.log('connection error');
                });
            }
        };
    }]);
