var MOMApp = angular.module('MOMApp', ['ngRoute', 'ngResource', 'ngCookies', 'ngClipboard', 'ui.bootstrap', 'textAngular', 'ngLoadingSpinner']);

MOMApp.config(['$routeProvider',
  function($routeProvider) {      
    $routeProvider.
      when('/dashboard', {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }).
	  when('/projects', {
        templateUrl: 'templates/projects.html',
        controller: 'ProjectsCtrl'
      }).
      when('/projects/edit/:projectId', {
        templateUrl: 'templates/project-edit.html',
        controller: 'ProjectsCtrl'
      }).
	  when('/team-members', {
        templateUrl: 'templates/team-members.html',
        controller: 'TeamMembersCtrl'
      }).
	  when('/reports', {
        templateUrl: 'templates/reports.html',
        controller: 'ReportsCtrl'
      }).
      /*when('/reports/view', {
        templateUrl: 'templates/reports-view.html',
        controller: 'ReportsViewCtrl'
      }).*/
      when('/mom/view/:momId', {
        templateUrl: 'templates/mom-view.html',
        controller: 'MOMViewCtrl'
      }).
      when('/mom/:action', {
        templateUrl: 'templates/mom-form.html',
        controller: 'MOMFormCtrl'
      }).
	  when('/mom/:action/:momId', {
        templateUrl: 'templates/mom-form.html',
        controller: 'MOMFormCtrl'
      }).
      otherwise({
        redirectTo: '/dashboard'
      });
  }]);

MOMApp.config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
  }]);

/**
 * "userService" that exposes the User API as an ngResource.
 * This is also used to share data between different User Controllers.
 */
MOMApp.factory('userService', function($http, $q, $log, $timeout, $resource, $cookies) {
	var url = '/api/user';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'authenticate': {method: 'JSONP', url: '/api/user/login?email=:email&password=:password', isArray: true},
		'logout': {method: 'JSONP', url: '/api/user/logout'}
	});
	
	var factory = {};
	
	factory.getRestApi = function() {
		return restApi;
	};
	
	factory.getUserCookie = function() {
		return {
			id: $cookies["userId"],
			name: $cookies["userName"],
			email: $cookies["userEmail"],
			isAdmin: ($cookies["userIsAdmin"] == "true")
		};
	}; 
	
	return factory;
});

/**
 * "momService" that exposes the MOM API as an ngResource.
 * This is also used to share data between different MOM Controllers.
 */
MOMApp.factory('momService', function($http, $q, $log, $timeout, $resource, $cacheFactory) {
    var factory = {};
    var url = '/api/mom';
    
    var locals = {
        cache: $cacheFactory('momServiceCache'),
        interceptor: {
            response: function (response) {
//                locals.cache.remove(response.config.url);
//                $log.debug('cache removed', response.config.url);
                locals.cache.remove(url);
                return response;
            }
        },
        activeMom: null
    };
    
    //callback: 'JSON_CALLBACK'
	var restApi = $resource(url, {}, {
        'query': {method: 'GET', url: '/api/mom', isArray:true, cache: locals.cache},
		'getById': {method: 'GET', url: '/api/mom/:id', cache: locals.cache},
		'delete': {method: 'DELETE', url: '/api/mom/:id', interceptor: locals.interceptor},
		'update': {method: 'PUT', url: '/api/mom/:id', interceptor: locals.interceptor},
        'save': {method: 'POST', url: '/api/mom', interceptor: locals.interceptor}
	});
	
	factory.getRestApi = function() {
		return restApi;
	};
    
	factory.getNewMOM = function() {
		var mom = {
			project: '',
			title: '',
			createdOn: moment(),
			updatedOn: '',
			minutesTaker: null, //{name: '', email: ''}
			attendees: [], //Array of {name: '', email: ''}
			items: [
				{category: '', description: '', owner: null, status: '', dueDate: '', type: '', richText: false}
			]
		};
		return mom;
	};
    
    factory.setActiveMom = function(mom) {
        locals.activeMom = mom;
    };
    
    factory.getActiveMom = function() {
        return locals.activeMom;
    };
    
	return factory;
}); 

/**
 * "projectsService" that exposes the Project API as an ngResource.
 * This is also used to share data between different Project Controllers.
 */
MOMApp.factory('projectsService', function($http, $q, $log, $resource) {	
	var url = '/api/projects';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'getAll': {method: 'JSONP', isArray: true, cache: true},
        'getById': {method: 'GET', url: '/api/projects/:id', cache: true},
		'delete': {method: 'DELETE', url: '/api/projects/:id'},
		'update': {method: 'PUT', url: '/api/projects/:id'}
	});
	
	var factory = {};
	
	factory.getRestApi = function() {
		return restApi;
	};
	
	factory.getNewProject = function() {
		var project = {
			name: '',
			description: '',
			teamMembers: [], //array of team members
			createdOn: moment(),
			updatedOn: ''
		};
		return project;
	};
	
	return factory;
}); 

MOMApp.factory('windowService', function($log, $window) {
    var factory = {};
    
    var locals = {
        extrasmall: 'xs',
        small: 'sm',
        medium: 'md',
        large: 'lg'
    };
    
    factory.getScreenType = function() {
        //$log.debug(angular.element($window.top).width());        
        var width = angular.element($window.top).width();
        if(width < 768) {
            return locals.extrasmall;
        } else if(width < 992) {
            return locals.small;   
        } else if(width < 1200) {
            return locals.medium;
        } else {
            return locals.large;   
        }
    };
    
    return factory;
});

MOMApp.factory('teamMembersService', function($http, $q, $log, $resource) {
	var url = '/api/team-members';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'getAll': {method: 'JSONP', isArray: true, cache: true},
		'delete': {method: 'DELETE', url: '/api/team-members/:id'},
		'update': {method: 'PUT', url: '/api/team-members/:id'}
	});
		
	var factory = {};
	
	factory.getRestApi = function() {
		return restApi;
	};
	
	factory.getNewMember = function() {
		var member = {
			name: '',
			email: '',
			password: '',
			initials: '',
			skills: '',
			createdOn: moment(),
			updatedOn: ''
		};
		return member;
	};
	
	return factory;
}); 

MOMApp.controller('HeaderCtrl', function($scope, $modal, $log, $filter, $cookies, userService) {	
	var locals = {
		userRestApi: userService.getRestApi()
	};
	
	$scope.currentUser = userService.getUserCookie();
	
	$scope.logout = function() {
		locals.userRestApi.logout(function(res) {
			if(res.success) {
				$cookies["userEmail"] = null;
				$cookies["userName"] = null;
				$cookies["userId"] = null;
				$cookies["userIsAdmin"] = null;
				
				window.location.reload();
			}
		});
	};
});

/**
 * Application Dashboard Controller.
 */
MOMApp.controller('DashboardCtrl', function($scope, $modal, $log, $filter, $timeout, $cookies, $location, momService, windowService) {	
	var locals = {
		restApi: null,
        screenType: windowService.getScreenType()
	};
		
	$scope.init = function() {
		locals.restApi = momService.getRestApi();		
        $scope.screenType = locals.screenType;        
        $scope.selectedMOM = momService.getActiveMom(); //Valid MOM object or NULL.
		$scope.dateFormat = 'MM/DD/YYYY';
                
        $scope.list = locals.restApi.query({}, function(data) {
            for(var i = 0;i < $scope.list.length;i++) {
				$scope.list[i].createdOn = moment($scope.list[i].createdOn);
				$scope.prepareMomForView($scope.list[i]);
			}
			
			$scope.list = $filter('orderBy')($scope.list, 'createdOn', true);
            
			if($scope.list.length > 0) {
                if(locals.screenType == 'md' || locals.screenType == 'lg') {
				    $scope.view($scope.list[0]);
                }
			}
        });        
	};
	
	$scope.view = function(mom) {
        if(locals.screenType == 'md' || locals.screenType == 'lg') {
            $scope.selectedMOM = mom;
            momService.setActiveMom(mom);
        } else {
            $scope.selectedMOM = mom;
            momService.setActiveMom(mom);
            $location.path('/mom/view/'+mom._id);  
        }
	};
    
    $scope.edit = function(mom) {
        $scope.selectedMOM = mom;
        momService.setActiveMom(mom);
        $location.path('/mom/edit/'+mom._id);  
    };
	
	$scope.prepareMomForView = function(mom) {		
		var mailtoURL = '';
		for(var i = 0;i < mom.attendees.length;i++) {
			if(mailtoURL != '') {
				mailtoURL += ';';
			}
			if(!angular.equals(mom.attendees[i].email, '')) {
				mailtoURL += mom.attendees[i].email;
			}
		}
		mailtoURL += '&subject='+mom.project.name+': '+mom.title+' ['+mom.createdOn.format('MM/DD/YYYY')+']&body=<copy and paste contents from the Web Page in here>';
		mom.mailtoURL = mailtoURL;
		
		//Update Owner Reference for each of the items.
		for(var i = 0;i < mom.items.length;i++) {
			//$log.debug($scope.selectedMOM.items[i].dueDate);
			if(!angular.equals(moment(mom.items[i].dueDate).format(), 'Invalid date')) {
				mom.items[i].dueDate = moment(mom.items[i].dueDate);
			}
		}
	};
	
	$scope.print = function() {		
		var printContents = document.getElementById('mom-content').innerHTML;
		var popupWin = window.open('', '_blank');
		popupWin.document.open()
		popupWin.document.write('<html><head><link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css"><link rel="stylesheet" href="lib/font-awesome-4.3.0/css/font-awesome.min.css"><link rel="stylesheet" href="css/styles.css"></head><body onload="window.print()">' + printContents + '</html>');
		popupWin.document.close();
	};
	
	$scope.copy = function() {
		var momContent = angular.element(document.getElementById('mom-content'));
		//$scope.bang = momContent.html();
		return momContent.html();
		//$log.debug(momContent.text());
	};
    
    $scope.flashUnavailable = function() {
        var momContent = angular.element(document.getElementById('mom-content'));
        window.prompt("Hit Ctrl+C to copy the text. \n\nConsider installing Flash plugin for the browser to be able to Copy text easily.", momContent.html());
    };
    
	$scope.init();
});

/**
 * View a MOM Controller.
 * @params
 * momId - ID of the MOM that is to be viewed.
 */
MOMApp.controller('MOMViewCtrl', function($scope, $log, $routeParams, momService) {	
    var locals = {
        restApi: momService.getRestApi()
    };
    
    $scope.init = function() {
        var momId = $routeParams.momId;
        
        $scope.selectedMOM = momService.getActiveMom();
        if($scope.selectedMOM == null) {
          $scope.selectedMOM = locals.restApi.getById({id: momId}, function(data) {
            $scope.selectedMOM.createdOn = moment($scope.selectedMOM.createdOn);
              momService.setActiveMom($scope.selectedMOM);
            $scope.prepareMomForView($scope.selectedMOM);
		  });
        } else {
          $scope.prepareMomForView($scope.selectedMOM);
        }
    };
    
    $scope.prepareMomForView = function(mom) {		
		var mailtoURL = '';
		for(var i = 0;i < mom.attendees.length;i++) {
			if(mailtoURL != '') {
				mailtoURL += ';';
			}
			if(!angular.equals(mom.attendees[i].email, '')) {
				mailtoURL += mom.attendees[i].email;
			}
		}
		mailtoURL += '&subject='+mom.project.name+': '+mom.title+' ['+mom.createdOn.format('MM/DD/YYYY')+']&body=<copy and paste contents from the Web Page in here>';
		mom.mailtoURL = mailtoURL;
		
		//Update Owner Reference for each of the items.
		for(var i = 0;i < mom.items.length;i++) {
			//$log.debug($scope.selectedMOM.items[i].dueDate);
			if(!angular.equals(moment(mom.items[i].dueDate).format(), 'Invalid date')) {
				mom.items[i].dueDate = moment(mom.items[i].dueDate);
			}
		}
	};
    
    $scope.init();
});

/**
 * Modal Form Controller.
 */
MOMApp.controller('MOMFormCtrl', function($scope, $log, $routeParams, $filter, $location, momService, projectsService, teamMembersService, userService) {
	var locals = {
		restApi: null,
		projectsRestApi: null,
		membersRestApi: null
	};
    
	$scope.init = function() {
		locals.restApi = momService.getRestApi();
		locals.projectsRestApi = projectsService.getRestApi();
		locals.membersRestApi = teamMembersService.getRestApi();
		
		$scope.datepickerFormat = 'MM/dd/yyyy';
		
		$scope.teamMembers = locals.membersRestApi.getAll();
		$scope.projects = locals.projectsRestApi.getAll();
		$scope.mom = null;
		var action = $routeParams.action;
		if(action == 'create') {
			$scope.mom = momService.getNewMOM();
		} else {
			var momId = $routeParams.momId;
            if(momService.getActiveMom() == null) {
			  $scope.mom = locals.restApi.getById({id: momId}, function(data) {
				$scope.prepareMomForEdit();
			  });
            } else {
              $scope.mom = momService.getActiveMom();  
            }
		}
		
		$scope.currentUser = userService.getUserCookie();
		
		$scope.form = {
			action: action,
			title: (action == 'create') ? 'Create Minutes' : 'Edit Minutes',			
			minutesTaker: '', //Name of the person. String.
			attendeeName: '',
			attendees: [],
			statuses: ['New', 'In Progress', 'Done', '-NA-'],
			types: ['TODO', 'Issue', 'Agenda', 'Decision', 'Info', 'Idea', 'Follow-up'],
			categories: [],
			errorMessage: '',
			successMessage: '',
			
			attendeeSelected: function($item, $model, $label) {
				var foundItems = $filter('filter')($scope.form.attendees, {name: $item.name, email: $item.email});
				if(foundItems.length == 0) {
					$scope.form.attendees.push($item);					
				}
				$scope.form.attendeeName = '';
			},
			
			minutesTakerSelected: function($item, $model, $label) {
				$scope.mom.minutesTaker = $item;
			},
			
			ownerSelected: function($item, $model, $label, row) {
				row.owner = $item;
			},
			
			addToCategoryDict: function(category) {
				//$log.debug(category);
				$scope.form.categories.push(category);
			},
			
			addRow: function() {
				$scope.mom.items.push({category: '', description: '', owner: null, status: '', dueDate: '', type: '', richText: false});
			},
			
			removeEmpty: function() {
				var mom = $scope.mom;
				var items = [];
				for(var i = 0;i < mom.items.length;i++) {
					var mi = mom.items[i];
					if(!angular.equals(mi.description, '')) {
						items.push(mi);
					}
				}
				$scope.mom.items = items;
			},
			
			openDatePicker: function($event, row) {
				$event.preventDefault();
				$event.stopPropagation();
				row.showDatePicker = true;
			},
			
			//Invoked when a Project a selected.
			populateAttendeesFromProject: function() {
				var project = $scope.mom.project;
				$scope.form.attendees = [];
				for(var i = 0;i < project.teamMembers.length;i++) {
					$scope.form.attendees.push(project.teamMembers[i]);
				}
			},
			
			removeAttendee: function(attendee) {
				var attendees = [];
				for(var i = 0;i < $scope.form.attendees.length;i++) {
					if(!angular.equals($scope.form.attendees[i], attendee)) {
						attendees.push($scope.form.attendees[i]);
					}
				}
				$scope.form.attendees = attendees;
			},
			
			moveRowUp: function() {
				var row = $scope.form.selectedRow;
				var index = $scope.mom.items.indexOf(row);
				if((index-1) >= 0) {
					var prevRow = $scope.mom.items[index-1];
					$scope.mom.items[index-1] = row;
					$scope.mom.items[index] = prevRow;
				}
			},
			
			moveRowDown: function() {
				var row = $scope.form.selectedRow;
				var index = $scope.mom.items.indexOf(row);
				if((index+1) < $scope.mom.items.length) {
					var nextRow = $scope.mom.items[index+1];
					$scope.mom.items[index+1] = row;
					$scope.mom.items[index] = nextRow;
				}
			},
			
			removeRow: function() {
				var items = [];
				for(var i = 0;i < $scope.mom.items.length;i++) {
					if(!angular.equals($scope.mom.items[i], $scope.form.selectedRow)) {
						items.push($scope.mom.items[i]);
					}
				}
				$scope.mom.items = items;
			}
		};
	};
	
	$scope.prepareMomForEdit = function() {
		$scope.mom.createdOn = moment($scope.mom.createdOn);
		$scope.form.title = $scope.mom.title+' - '+$scope.mom.createdOn.format('MM/DD/YYYY')+' ('+$scope.form.action+')';
		$scope.form.minutesTaker = $scope.mom.minutesTaker.name; 
		
		$scope.form.attendees = [];
		for(var i = 0;i < $scope.mom.attendees.length;i++) {
			$scope.form.attendees.push($scope.mom.attendees[i]);
		}
	};
	
	$scope.resetForm = function() {
		$scope.form.minutesTaker = '';
		$scope.form.attendees = [];
		$scope.form.attendeeName = '';
	};
	
	$scope.delete = function() {
		locals.restApi.delete({id: $scope.mom._id}, function(res) {
			$location.path('/dashboard');
		});
	};
	
	$scope.gotoPath = function(path) {
		$location.path(path);
	};
	
	$scope.saveAs = function() {
		$scope.form.successMessage = '';
		$scope.form.errorMessage = '';
		
		$scope.mom.attendees = $scope.form.attendees;
		if($scope.mom.items.length > 1) {
			$scope.form.removeEmpty();
		}
		
		$scope.mom.createdOn = moment();
		$scope.mom.modifiedBy = null;
		$scope.mom.modifiedOn = null;
		
		delete $scope.mom._id;
		locals.restApi.save({}, $scope.mom, function(res) {
			$scope.mom._id = res._id;
			$scope.form.title = $scope.mom.title+' - '+$scope.mom.createdOn.format('MM/DD/YYYY')+' ('+$scope.form.action+')';
			$scope.form.successMessage = 'Successfully cloned MOM.';
		}, function(err) {
			$scope.form.errorMessage = 'Error saving Data! ' + err.statusText;
		});
	};
	
	$scope.save = function() {
		$scope.form.successMessage = '';
		$scope.form.errorMessage = '';
		
		$scope.mom.attendees = $scope.form.attendees;
		if($scope.mom.items.length > 1) {
			$scope.form.removeEmpty();
		}
				
		if($scope.mom._id == null) {				
			locals.restApi.save({}, $scope.mom, function(res) {
				$scope.form.action = 'edit';
				$scope.mom._id = res._id;
				$scope.form.title = $scope.mom.title+' - '+$scope.mom.createdOn.format('MM/DD/YYYY')+' ('+$scope.form.action+')';
				$scope.form.successMessage = 'Successfully created MOM.';
			}, function(err) {
				$scope.form.errorMessage = 'Error saving Data! ' + err.statusText;
			});
		} else {
			locals.restApi.update({id: $scope.mom._id}, $scope.mom, function(res) {
				$scope.form.title = $scope.mom.title+' - '+$scope.mom.createdOn.format('MM/DD/YYYY')+' ('+$scope.form.action+')';
				$scope.form.successMessage = 'Successfully updated MOM.';
			}, function(err) {
				$scope.form.errorMessage = 'Error saving Data! ' + err.statusText;
			});
		}
	};
	
	$scope.init();
});

MOMApp.controller('ProjectsCtrl', function($scope, $log, $filter, $cookies, $routeParams, $location, projectsService, teamMembersService, userService, windowService) {
	var locals = {
		restApi: null,
		membersRestApi: null,
        screenType: windowService.getScreenType()
	};
	$scope.init = function() {
        $scope.screenType = locals.screenType;
		locals.restApi = projectsService.getRestApi();
		locals.membersRestApi = teamMembersService.getRestApi();
		
        $scope.team = locals.membersRestApi.getAll(null, function(data) {
            if(typeof $routeParams.projectId != 'undefined') {
                var projectId = $routeParams.projectId;   
          var project = locals.restApi.getById({id: projectId}, function(data) {
              $scope.form.errorMessage = '';
		      $scope.form.successMessage = '';
		      $scope.form.title = 'Update Project: '+project.name;
              $scope.form.project = project;
		      $scope.prepareProjectForEdit($scope.form.project);
          });
            }
        });
        if(typeof $routeParams.projectId == 'undefined') { //The project is not in edit mode.
		  $scope.projects = locals.restApi.getAll();
        }
		
		$scope.form = {
			title: 'Add Project',
			errorMessage: '',
			successMessage: '',
			project: projectsService.getNewProject()
		};
		
		$scope.currentUser = userService.getUserCookie();
	};
	
	$scope.edit = function(project) {
        if(locals.screenType == 'md' || locals.screenType == 'lg') {
		  $scope.form.errorMessage = '';
		  $scope.form.successMessage = '';
		  $scope.form.title = 'Update Project';
		  $scope.form.project = project;
		  $scope.prepareProjectForEdit($scope.form.project);
        } else {
          $location.path('/projects/edit/'+project._id);
        }
	};
	
	$scope.prepareProjectForEdit = function(project) {
		var selectedMembers = $filter('filter')($scope.team, {isChecked: true});
		for(var i = 0;i < selectedMembers.length;i++) {
			selectedMembers[i].isChecked = false;
		}
		
//        $log.debug(project.teamMembers);
		for(var i = 0;i < project.teamMembers.length;i++) {
			for(var j = 0;j < $scope.team.length;j++) {
				if((typeof project.teamMembers[i] == 'string' && $scope.team[j]._id == project.teamMembers[i])
					|| (typeof project.teamMembers[i] == 'object' && $scope.team[j]._id == project.teamMembers[i]._id)) {
					$scope.team[j].isChecked = true;
					break;
				}
			}
		}
        
//        $log.debug($scope.team);
	};
	
	$scope.deleteProject = function() {
		locals.restApi.delete({id: $scope.form.project._id}, function(res) {
			$scope.resetForm();
			$scope.projects = locals.restApi.getAll();
			$scope.form.successMessage = '';
			$scope.form.errorMessage = '';
		}, function(err) {});
	};
	
	$scope.saveProject = function() {
		if(!angular.equals($scope.form.project.name, '')) {
			$scope.form.errorMessage = '';
			if($scope.form.project._id != null) { //PUT		
				var selectedMembers = $filter('filter')($scope.team, {isChecked: true});
				$scope.form.project.teamMembers = selectedMembers;
		
				locals.restApi.update({id: $scope.form.project._id}, $scope.form.project, function(res) {					
					$scope.form.successMessage = 'Successfully updated Project.';					
				}, function(err) {
					$scope.form.errorMessage = 'Error saving Data! ' + err;
				});
			} else { //POST
				var selectedMembers = $filter('filter')($scope.team, {isChecked: true});
				$scope.form.project.teamMembers = selectedMembers;
				
				locals.restApi.save({}, $scope.form.project, function(res) {
					$scope.form.successMessage = 'Successfully created Project.';
					$scope.projects.push(res);// = locals.restApi.getAll();
					$scope.form.project = res;
					$scope.form.title = 'Update Project';
					$scope.prepareProjectForEdit($scope.form.project);					
				}, function(err) {
					$scope.form.errorMessage = 'Error saving Data! ' + err;
				});
			}
		} else {
			$scope.form.errorMessage = "Please enter Team Member's name.";
		}
	};
	
	$scope.resetForm = function() {
		$scope.form.project = projectsService.getNewProject();
		$scope.form.title = 'Add Project';
		var selectedMembers = $filter('filter')($scope.team, {isChecked: true});
		for(var i = 0;i < selectedMembers.length;i++) {
			selectedMembers[i].isChecked = false;
		}
		$scope.form.errorMessage = '';
	};
	
	$scope.init();
});

MOMApp.controller('TeamMembersCtrl', function($scope, $log, $cookies, teamMembersService, userService, windowService) {
	var locals = {
		restApi: null,
        screenType: windowService.getScreenType()
	};
	
	$scope.init = function() {
        $scope.screenType = locals.screenType;
		locals.restApi = teamMembersService.getRestApi();		
		$scope.team = locals.restApi.getAll();
		$scope.form = {
			title: 'Add Member',
			errorMessage: '',
			successMessage: '',
			member: teamMembersService.getNewMember()
		};
		$scope.currentUser = userService.getUserCookie();		
	};
	
	$scope.edit = function(member) {
		$scope.form.member = member;
		$scope.form.title = 'Update Member: '+$scope.form.member.name;
		$scope.form.action = 'edit';
		$scope.form.successMessage = '';
		$scope.form.errorMessage = '';
	};
	
	$scope.deleteMember = function() {
		locals.restApi.delete({id: $scope.form.member._id}, function(res) {
			$scope.resetForm();
			$scope.team = locals.restApi.getAll();
			$scope.form.successMessage = '';
			$scope.form.errorMessage = '';
		}, function(err) {});
	};
	
	$scope.saveMember = function() {
		if(!angular.equals($scope.form.member.name, '')) {
			$scope.form.errorMessage = '';
			if($scope.form.member._id != null) { //PUT
				locals.restApi.update({id: $scope.form.member._id}, $scope.form.member, function(res) {
					//TODO: Show Success message.
					$scope.form.successMessage = 'Successfully updated Team Member.';
					//$scope.team = locals.restApi.getAll();
				}, function(err) {
					$scope.form.errorMessage = 'Error saving Data! ' + err;
				});
			} else { //POST
				locals.restApi.save({}, $scope.form.member, function(res) {
					$scope.form.successMessage = 'Successfully created Team Member.';
					$scope.form.member = res;
					$scope.form.title = 'Update Member';
					$scope.form.action = 'edit';
					$scope.team.push(res);
				}, function(err) {
					$scope.form.errorMessage = 'Error saving Data! ' + err;
				});
			}
		} else {
			$scope.form.errorMessage = "Please enter Team Member's name.";
		}
	};
	
	$scope.resetForm = function() {
		$scope.form.member = teamMembersService.getNewMember();
		$scope.form.title = 'Add Member';
		$scope.form.action = 'add';
		$scope.form.errorMessage = '';
	};
	
	$scope.init();
});

MOMApp.controller('LoginCtrl', function($scope, $log, $cookies, userService) {
	var locals = {
		restApi: null
	};
	
	$scope.init = function() {
		locals.restApi = userService.getRestApi();
		
		$scope.email = '';
		$scope.password = '';
	};
	
	$scope.authenticate = function() {
		$scope.errorMessage = '';
		var usersFound = locals.restApi.authenticate({email: $scope.email, password: $scope.password}, function(res) {
			if(res.length > 0) {
				$cookies["userEmail"] = res[0].email;
				$cookies["userName"] = res[0].name;
				$cookies["userId"] = res[0]._id;
				$cookies["userIsAdmin"] = (res[0].isAdmin != null) ? res[0].isAdmin : false;
				window.location.reload();
			} else {
				$scope.errorMessage = 'Invalid Username or Password.';
			}
		});
	};
	
	$scope.init();
});

MOMApp.controller('ReportsCtrl', function($scope, $location, $filter, $log, $cookies, momService, windowService) {
	var locals = {
		momRestApi: null,
        screenType: windowService.getScreenType()
	};
	
	$scope.init = function() {
		$scope.today = moment();
		
		locals.momRestApi = momService.getRestApi();
		
		$scope.dateFormat = 'MM/DD/YYYY';
		$scope.screenType = locals.screenType;
		$scope.list = locals.momRestApi.getAll({}, function(data) {
			for(var i = 0;i < $scope.list.length;i++) {
				$scope.list[i].createdOn = moment($scope.list[i].createdOn);
			}
			
			$scope.list = $filter('orderBy')($scope.list, 'createdOn', true);
		});
		
		$scope.selectedMoms = [];
	};
	
	$scope.gotoPath = function(path) {
		$location.path('/dashboard');
	};
	
	$scope.print = function() {		
		var printContents = document.getElementById('mom-content').innerHTML;
		var popupWin = window.open('', '_blank');
		popupWin.document.open()
		popupWin.document.write('<html><head><link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css"><link rel="stylesheet" href="lib/font-awesome-4.3.0/css/font-awesome.min.css"><link rel="stylesheet" href="css/styles.css"></head><body onload="window.print()">' + printContents + '</html>');
		popupWin.document.close();
	};
	
	$scope.copy = function() {
		var momContent = angular.element(document.getElementById('mom-content'));
		//$scope.bang = momContent.html();
		return "<style type='text/css'>label { font-weight: bold; }</style>"+momContent.html();
		//$log.debug(momContent.text());
	};
	
	$scope.momClicked = function() {
		$scope.selectedMoms = $filter('filter')($scope.list, {isChecked: true});		
	};
	
	$scope.init();
});