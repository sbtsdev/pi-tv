(function () {
	var holder = document.getElementById('holder'),
		tests = {
			filereader: typeof FileReader != 'undefined',
			dnd: 'draggable' in document.createElement('span'),
			formdata: !!window.FormData,
			progress: "upload" in new XMLHttpRequest()
		},
		accepted_type = {
			'image/png': true,
			'image/jpeg': true,
			'image/gif': true
		},
		template = {
			'img_up'	: Handlebars.compile($('#img_up_tmpl').html())
		};

	function progress_handler(e){
		var perc = e.total / e.loaded * 100;
		if(e.lengthComputable){
			$('#uploadprogress>span').css('width', perc + '%');
		}
	}

	function display_images(files) {
		var i = 0, files_len = files.length, tmpl_info = {},
			file_list = $('.file-list');
		file_list.children().remove();
		for (; i < files_len; i += 1) {
			tmpl_info = {
				'img_src' : files[i],
				'img_alt' : '',
				'file_name' : files[i].substr(files[i].lastIndexOf('/') + 1)
			};
			file_list.append(template.img_up(tmpl_info));
		}
	}

	function display_message(message, error) {
		var msg_wrap = $('<p>').text(message);
		if (error) {
			$('.upload-response').addClass('error-text').append(msg_wrap);
		} else {
			$('.upload-response').removeClass('error-text').append(msg_wrap);
		}
	}

	function get_images(image_displayer) {
		$.ajax({
			'url'	: '../ws/files.php',
			'data'	: {
				'action': 'get_files',
				'from'	: 'admin'
			},
			'dataType'	: 'json',
			'success'	:	function (rjson) {
								if (rjson && rjson.success) {
									image_displayer(rjson.files);
								} else {
									display_message(rjson.message || "No files returned.", true);
								}
			},
			'error'	:	function (jqXHR, textStatus, errorThrown) {
							display_message(errorThrown, true);
			}
		});
	}

	function read_files(files) {
		var i = 0, files_len = files.length,
			form_data = tests.formdata ? new FormData() : null;
		if (tests.formdata) {
			for (; i < files_len; i++) {
				if (accepted_type[files[i].type]) {
					form_data.append('file[]', files[i]);
				}
			}
			form_data.append('action', 'upload_files');
			form_data.append('from', 'admin');

			$('#uploadprogress>span').css('width', '0%');
			$.ajax({
				'url'		:	'../ws/files.php',
				'type'		:	'post',
				'data'		:	form_data,
				'dataType'	:	'json',
				'xhr'		:	function () {
								var myXHR = $.ajaxSettings.xhr();
								if (myXHR.upload) {
									myXHR.upload.addEventListener('progress', progress_handler, false);
								}
								return myXHR;
				},
				'success'	:	function (rjson) {
									var i = 0, up_len;
									if (rjson && rjson.success) {
										get_images(display_images);
										display_message(rjson.message, false);
										if (rjson.files) {
											up_len = rjson.files.length;
											for(;i < up_len; i += 1) {
												display_message(rjson.files[i].replace('../uploads/', ''), false);
											}
										}
									} else if (rjson && rjson.success === false) {
										display_message(rjson.message + rjson.failed.join(', '), true);
									}
				},
				'error'		:	function (jqXHR, textStatus, errorThrown) {
									display_message(errorThrown, true);
				},
				'cache': false,
				'contentType': false,
				'processData': false
			});
		}
	}

	function delete_files(form_data) {
		if (tests.formdata && (form_data instanceof FormData)) {
			form_data.append('action', 'delete_files');
			form_data.append('from', 'admin');
			$.ajax({
				'url'		:	'../ws/files.php',
				'type'		:	'post',
				'data'		:	form_data,
				'dataType'	:	'json',
				'success'	:	function (rjson) {
									if (rjson && rjson.success) {
										get_images(display_images);
										display_message(rjson.message, false);
										if (rjson.files) {
											for(del_len = rjson.files.length; i < del_len; i+= 1) {
												display_message(rjson.files[i].replace('../uploads/', ''), false);
											}
										}
									} else if (rjson && (!rjson.success)) {
										display_message(rjson.message, true);
									}
				},
				'error'		:	function (jqXHR, textStatus, errorThrown) {
									display_message(errorThrown, true);
				},
				'cache'		: false,
				'contentType':false,
				'processData':false
			});
		}
	}

	if ((tests.filereader === false) || (tests.formdata === false) || (tests.dnd === false)) {
		$('.fallbacks').css('display', 'block');
		$('.space-age').css('display', 'none');
	}

	if (tests.dnd) {
		holder.ondragover = function () { this.className = 'hover'; return false; };
		holder.ondragend = function () { this.className = ''; return false; };
		holder.ondrop = function (e) {
			this.className = '';
			e.preventDefault();
			read_files(e.dataTransfer.files);
		};
	} else {
		document.querySelector('input').onchange = function () {
			read_files(this.files);
		};
	}

	$('.file-list').on('click', '.img-file', function (e) {
		if ($(this).is(':checked')) {
			$(this).closest('.img-up').addClass('img-selected');
		} else {
			$(this).closest('.img-up').removeClass('img-selected');
		}
	});

	$('.file-list').on('click', '.delete-button', function (e) {
		var form_data;
		if (tests.formdata && ($(this).data('file_name').length > 0)) {
			form_data = new FormData();
			form_data.append('file[]', $(this).data('file_name'));
			delete_files(form_data);
		}
	});

	$('.select-all').on('click', function (e) {
		var files = $('.img-file');
		if (files.length > 0) {
			files.attr('checked', true).closest('.img-up').addClass('img-selected');
		}
	});

	$('.delete-selected').on('click', function (e) {
		var form_data, selected = $('.img-file:checked');
		if (tests.formdata && (selected.length > 0)) {
			form_data = new FormData();
			selected.each(function (i, elem) {
				form_data.append('file[]', $(this).data('file_name'));
			});
			delete_files(form_data);
		}
	});

	get_images(display_images);
}(jQuery));
