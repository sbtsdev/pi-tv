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
		progress = document.getElementById('uploadprogress');

	function progress_handler(e){
		if(e.lengthComputable){
			$('progress').attr('value', e.total / e.loaded * 100);
		}
	}

	function display_images(files) {
		var i = 0, files_len = files.length,
			img_templ = '<img class="file-list-img" width="300px" src="##file##" /><br>',
			file_list = $('.file-list');
		file_list.children().remove();
		for (; i < files_len; i += 1) {
			file_list.append(img_templ.replace('##file##', files[i]));
		}
	}

	function display_message(message, error) {
		if (error) {
			$('.upload-response').addClass('error-text').text(message);
		} else {
			$('.upload-response').removeClass('error-text').text(message);
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
									if (rjson && rjson.success) {
										get_images(display_images);
										display_message(rjson.message, false);
									} else if (rjson && rjson.success === false) {
										display_message(rjson.message + rjson.failed.join(', '));
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
	get_images(display_images);
}(jQuery));
