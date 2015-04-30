var MOMApp = angular.module('MOMApp', ['ngRoute', 'ngResource', 'ngClipboard', 'ui.bootstrap', 'textAngular']);

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
	  when('/team-members', {
        templateUrl: 'templates/team-members.html',
        controller: 'TeamMembersCtrl'
      }).
	  when('/reports', {
        templateUrl: 'templates/reports.html',
        controller: 'ReportsCtrl'
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

MOMApp.factory('userService', function($http, $q, $log, $timeout, $resource) {
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
	
	return factory;
});
  
MOMApp.factory('momService', function($http, $q, $log, $timeout, $resource) {
	var url = '/api/mom';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'getAll': {method: 'JSONP', isArray: true},
		'getById': {method: 'JSONP', url: '/api/mom/:id'},
		'delete': {method: 'DELETE', url: '/api/mom/:id'},
		'update': {method: 'PUT', url: '/api/mom/:id'}
	});
	
	var factory = {};
	
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
		
	return factory;
}); 

MOMApp.factory('projectsService', function($http, $q, $log, $resource) {	
	var url = '/api/projects';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'getAll': {method: 'JSONP', isArray: true},
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

MOMApp.factory('teamMembersService', function($http, $q, $log, $resource) {
	var url = '/api/team-members';
	var restApi = $resource(url, {
		callback: 'JSON_CALLBACK'
	}, {
		'getAll': {method: 'JSONP', isArray: true},
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
			initials: '',
			skills: '',
			createdOn: moment(),
			updatedOn: ''
		};
		return member;
	};
	
	return factory;
}); 

MOMApp.controller('HeaderCtrl', function($scope, $modal, $log, $filter, userService) {	
	var locals = {
		userRestApi: userService.getRestApi()
	};
	
	$scope.logout = function() {
		locals.userRestApi.logout(function(res) {
			if(res.success) {
				window.location.reload();
			}
		});
	};
});

MOMApp.controller('DashboardCtrl', function($scope, $modal, $log, $filter, $timeout, momService, projectsService, teamMembersService, userService) {	
	var locals = {
		restApi: null,
		projectsRestApi: null,
		membersRestApi: null
	};
	
	$scope.init = function() {
		locals.restApi = momService.getRestApi();
		locals.projectsRestApi = projectsService.getRestApi();
		locals.membersRestApi = teamMembersService.getRestApi();
			
		$scope.teamMembers = locals.membersRestApi.getAll();
		$scope.projects = locals.projectsRestApi.getAll();
		
		$scope.selectedMOM = null;
		$scope.dateFormat = 'MM/DD/YYYY';
		$scope.list = locals.restApi.getAll({}, function(data) {
			for(var i = 0;i < $scope.list.length;i++) {
				$scope.list[i].createdOn = moment($scope.list[i].createdOn);
				$scope.prepareMomForView($scope.list[i]);
			}
			
			$scope.list = $filter('orderBy')($scope.list, 'createdOn', true);
			
			if($scope.list.length > 0) {
				$scope.view($scope.list[0]);
			}
		});
	};
	
	$scope.view = function(mom) {
		$scope.selectedMOM = mom;
	};
	
	$scope.prepareMomForView = function(mom) {
		mom.project = $filter('filter')($scope.projects, {_id: mom.project})[0];
		mom.minutesTaker = $filter('filter')($scope.teamMembers, {_id: mom.minutesTaker})[0];
		
		var mailtoURL = '';
		for(var i = 0;i < mom.attendees.length;i++) {
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == mom.attendees[i]) {
					mom.attendees[i] = $scope.teamMembers[j];
					if(mailtoURL != '') {
						mailtoURL += ',';
					}
					if(!angular.equals(mom.attendees[i].email, '')) {
						mailtoURL += mom.attendees[i].email;
					}
					break;
				}
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
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == mom.items[i].owner) {
					mom.items[i].owner = $scope.teamMembers[j];
					break;
				}
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
		return "<style type='text/css'>label { font-weight: bold; }</style>"+momContent.html();
		//$log.debug(momContent.text());
	};
	
	$scope.init();
});

/**
 * Modal Form Controller.
 */
MOMApp.controller('MOMFormCtrl', function($scope, $log, $routeParams, $filter, $location, momService, projectsService, teamMembersService) {
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
			$scope.mom = locals.restApi.getById({id: momId}, function(data) {
				$scope.prepareMomForEdit();
			});
		}
		
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
					for(var j = 0;j < $scope.teamMembers.length;j++) {
						if($scope.teamMembers[j]._id == project.teamMembers[i]) {
							$scope.form.attendees.push($scope.teamMembers[j]);
							break;
						}
					}
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
		$scope.mom.project = $filter('filter')($scope.projects, {_id: $scope.mom.project})[0];
		$scope.form.title = $scope.mom.title+' - '+$scope.mom.createdOn.format('MM/DD/YYYY')+' ('+$scope.form.action+')';
		$scope.form.minutesTaker = $filter('filter')($scope.teamMembers, {_id: $scope.mom.minutesTaker})[0].name;
		$scope.form.attendees = [];
		for(var i = 0;i < $scope.mom.attendees.length;i++) {
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == $scope.mom.attendees[i]) {
					$scope.form.attendees.push($scope.teamMembers[j]);
					break;
				}
			}
		}
		
		//Update Owner Reference for each of the items.
		for(var i = 0;i < $scope.mom.items.length;i++) {
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == $scope.mom.items[i].owner) {
					$scope.mom.items[i].owner = $scope.teamMembers[j];
					break;
				}
			}
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
		$scope.mom._id = null;
		locals.restApi.save({}, $scope.mom, function(res) {
			$scope.mom = res;
			$scope.prepareMomForEdit();
			$scope.form.successMessage = 'Successfully created MOM.';
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
				$scope.mom = res;
				$scope.prepareMomForEdit();
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

MOMApp.controller('ProjectsCtrl', function($scope, $log, $filter, projectsService, teamMembersService) {
	var locals = {
		restApi: null,
		membersRestApi: null
	};
	$scope.init = function() {
		locals.restApi = projectsService.getRestApi();
		locals.membersRestApi = teamMembersService.getRestApi();
		
		$scope.projects = locals.restApi.getAll();
		$scope.team = locals.membersRestApi.getAll();
		
		$scope.form = {
			title: 'Add Project',
			errorMessage: '',
			successMessage: '',
			project: projectsService.getNewProject()
		};
	};
	
	$scope.edit = function(project) {
		$scope.form.errorMessage = '';
		$scope.form.successMessage = '';
		$scope.form.title = 'Update Project';
		$scope.form.project = project;
		$scope.prepareProjectForEdit($scope.form.project);
	};
	
	$scope.prepareProjectForEdit = function(project) {
		var selectedMembers = $filter('filter')($scope.team, {isChecked: true});
		for(var i = 0;i < selectedMembers.length;i++) {
			selectedMembers[i].isChecked = false;
		}
		
		for(var i = 0;i < project.teamMembers.length;i++) {
			for(var j = 0;j < $scope.team.length;j++) {
				if((typeof project.teamMembers[i] == 'string' && $scope.team[j]._id == project.teamMembers[i])
					|| (typeof project.teamMembers[i] == 'object' && $scope.team[j]._id == project.teamMembers[i]._id)) {
					$scope.team[j].isChecked = true;
					break;
				}
			}
		}
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

MOMApp.controller('TeamMembersCtrl', function($scope, $log, teamMembersService) {
	var locals = {
		restApi: null
	};
	$scope.init = function() {
		locals.restApi = teamMembersService.getRestApi();		
		$scope.team = locals.restApi.getAll();
		$scope.form = {
			title: 'Add Member',
			errorMessage: '',
			successMessage: '',
			member: teamMembersService.getNewMember()
		};
	};
	
	$scope.edit = function(member) {
		$scope.form.title = 'Update Member';
		$scope.form.member = member;
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
		$scope.form.errorMessage = '';
	};
	
	$scope.init();
});

MOMApp.controller('LoginCtrl', function($scope, $log, userService) {
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
			//$log.debug('baburao', res, res.length);
			if(usersFound.length > 0) {
				window.location.reload();
			} else {
				$scope.errorMessage = 'Invalid Username or Password.';
			}
		});
	};
	
	$scope.init();
});

MOMApp.controller('ReportsCtrl', function($scope, $location, $filter, $log, momService, projectsService, teamMembersService) {
	var locals = {
		momRestApi: null,
		membersRestApi: null,
		projectsRestApi: null
	};
	
	$scope.init = function() {
		locals.momRestApi = momService.getRestApi();
		locals.membersRestApi = teamMembersService.getRestApi();
		locals.projectsRestApi = projectsService.getRestApi();
		
		$scope.dateFormat = 'MM/DD/YYYY';
		$scope.teamMembers = locals.membersRestApi.getAll();
		$scope.projects = locals.projectsRestApi.getAll();
		
		$scope.list = locals.momRestApi.getAll({}, function(data) {
			for(var i = 0;i < $scope.list.length;i++) {
				$scope.list[i].createdOn = moment($scope.list[i].createdOn);
				$scope.prepareMomForView($scope.list[i]);
			}
			
			$scope.list = $filter('orderBy')($scope.list, 'createdOn', true);
		});
		
		$scope.selectedMoms = [];
	};
	
	$scope.gotoPath = function(path) {
		$location.path('/dashboard');
	};
	
	$scope.prepareMomForView = function(mom) {
		mom.project = $filter('filter')($scope.projects, {_id: mom.project})[0];
		mom.minutesTaker = $filter('filter')($scope.teamMembers, {_id: mom.minutesTaker})[0];
		
		var mailtoURL = '';
		for(var i = 0;i < mom.attendees.length;i++) {
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == mom.attendees[i]) {
					mom.attendees[i] = $scope.teamMembers[j];
					if(mailtoURL != '') {
						mailtoURL += ',';
					}
					if(!angular.equals(mom.attendees[i].email, '')) {
						mailtoURL += mom.attendees[i].email;
					}
					break;
				}
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
			for(var j = 0;j < $scope.teamMembers.length;j++) {
				if($scope.teamMembers[j]._id == mom.items[i].owner) {
					mom.items[i].owner = $scope.teamMembers[j];
					break;
				}
			}
		}
	};
	
	$scope.momClicked = function() {
		$scope.selectedMoms = $filter('filter')($scope.list, {isChecked: true});		
	};
	
	$scope.init();
});