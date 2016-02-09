/* globals Handlebars */
(function () {
    'use strict';
	var holder = document.getElementById('holder'),
        $progressView = $('#uploadprogress>span'),
        $fileList = $('.file-list'),
        $uploadResp = $('.upload-response'),
		tests = {
			filereader: typeof FileReader !== 'undefined',
			dnd: 'draggable' in document.createElement('span'),
			formdata: !!window.FormData,
			progress: 'upload' in new XMLHttpRequest()
		},
		acceptedType = {
			'image/png': true,
			'image/jpeg': true,
			'image/gif': true
		},
		template = {
			'imgUp'	: Handlebars.compile($('#img_up_tmpl').html())
		};

	function progressHandler(e){
		var perc = e.total / e.loaded * 100;
		if(e.lengthComputable){
			$progressView.css('width', perc + '%');
		}
	}

	function displayImages(files) {
		var i = 0, filesLen = files.length, tmplInfo = {};
		$fileList.children().remove();
		for (; i < filesLen; i += 1) {
			tmplInfo = {
				'img_src' : files[i],
				'img_alt' : '',
				'file_name' : files[i].substr(files[i].lastIndexOf('/') + 1)
			};
			$fileList.append(template.imgUp(tmplInfo));
		}
	}

	function displayMessage(message, error) {
		var $msgWrap = $('<p>').html(message);
		if (error) {
            $msgWrap.addClass('error-text');
		}
        $uploadResp.append($msgWrap);
	}

    function clearDisplay() {
        $uploadResp.html('');
    }

	function getImages(imageDisplayer) {
		$.ajax({
			'url'	: '/ws/files.php',
			'data'	: {
				'action': 'get_files',
				'from'	: 'admin'
			},
			'dataType'	: 'json',
			'success'	:	function (rjson) {
								if (rjson && rjson.success) {
									imageDisplayer(rjson.files);
								} else {
                                    clearDisplay();
									displayMessage(rjson.message || 'No files returned.', true);
								}
			},
			'error'	:	function (jqXHR, textStatus, errorThrown) {
                            clearDisplay();
							displayMessage(errorThrown, true);
			}
		});
	}

	function readFiles(files) {
		var i = 0, filesLen = files.length,
			formData = tests.formdata ? new FormData() : null;
        clearDisplay();
		if (tests.formdata) {
			for (; i < filesLen; i+=1) {
				if (acceptedType[files[i].type]) {
					formData.append('file[]', files[i]);
				}
			}
			formData.append('action', 'upload_files');
			formData.append('from', 'admin');

			$progressView.css('width', '0%');
			$.ajax({
				'url'		:	'/ws/files.php',
				'type'		:	'post',
				'data'		:	formData,
				'dataType'	:	'json',
				'xhr'		:	function () {
								var myXHR = $.ajaxSettings.xhr();
								if (myXHR.upload) {
									myXHR.upload.addEventListener('progress',
                                        progressHandler, false);
								}
								return myXHR;
				},
				'success'	:	function (rjson) {
									var i = 0, upLen, tmpFileName;
									if (rjson && rjson.success !== undefined) {
										getImages(displayImages);
										if (rjson.files) {
                                            displayMessage(rjson.message,
                                                false);
											upLen = rjson.files.length;
											for(;i < upLen; i += 1) {
                                                tmpFileName = rjson.files[i]
                                                    .replace('../uploads/', '');
												displayMessage(tmpFileName,
                                                    false);
											}
                                        } else {
                                            displayMessage(rjson.message, true);
                                        }
                                        if (rjson.success === false) {
                                            var errorFiles = rjson.failed,
                                                errorMessage = '';
                                            $.each(errorFiles,
                                                function (i, val) {
                                                    errorMessage += val.file +
                                                        ': ' + val.reason +
                                                        '<br>';
                                            });
                                            displayMessage(errorMessage, true);
                                        }
									} else {
                                        displayMessage('Server did not return',
                                                true);
									}
				},
				'error'		:	function (jqXHR, textStatus, errorThrown) {
									displayMessage(errorThrown, true);
				},
				'cache': false,
				'contentType': false,
				'processData': false
			});
        } else {
            displayMessage('Your browser is not up to date.', true);
        }
	}

	function deleteFiles(formData) {
        clearDisplay();
		if (tests.formdata && (formData instanceof FormData)) {
			formData.append('action', 'delete_files');
			formData.append('from', 'admin');
			$.ajax({
				'url'		:	'/ws/files.php',
				'type'		:	'post',
				'data'		:	formData,
				'dataType'	:	'json',
				'success'	:	function (rjson) {
									var i = 0, delLen;
									if (rjson && rjson.success) {
										getImages(displayImages);
										displayMessage(rjson.message, false);
										if (rjson.files) {
											for(delLen = rjson.files.length; i < delLen; i+= 1) {
												displayMessage(rjson.files[i].replace('../uploads/', ''), false);
											}
										}
									} else if (rjson && (!rjson.success)) {
										displayMessage(rjson.message, true);
									}
				},
				'error'		:	function (jqXHR, textStatus, errorThrown) {
									displayMessage(errorThrown, true);
				},
				'cache'		: false,
				'contentType':false,
				'processData':false
			});
        } else {
            displayMessage('Your browser is not up to date.', true);
        }
	}

	if ((tests.filereader === false) || (tests.formdata === false) ||
            (tests.dnd === false)) {
		$('.fallbacks').css('display', 'block');
		$('.space-age').css('display', 'none');
	}

	if (tests.dnd) {
		holder.ondragover = function () { this.className = 'hover'; return false; };
		holder.ondragend = function () { this.className = ''; return false; };
		holder.ondrop = function (e) {
			this.className = '';
			e.preventDefault();
			readFiles(e.dataTransfer.files);
		};
	} else {
		document.querySelector('input').onchange = function () {
			readFiles(this.files);
		};
	}

	$fileList.on('click', '.img-file', function () {
		if ($(this).is(':checked')) {
			$(this).closest('.img-up').addClass('img-selected');
		} else {
			$(this).closest('.img-up').removeClass('img-selected');
		}
	});

	$fileList.on('click', '.delete-button', function () {
		var formData;
		if (tests.formdata && ($(this).data('file_name').length > 0)) {
			formData = new FormData();
			formData.append('file[]', $(this).data('file_name'));
			deleteFiles(formData);
		}
	});

	$('.select-all').on('click', function () {
		var files = $('.img-file');
		if (files.length > 0) {
			files.attr('checked', true).closest('.img-up').addClass('img-selected');
		}
	});

	$('.delete-selected').on('click', function () {
		var formData, selected = $('.img-file:checked');
		if (tests.formdata && (selected.length > 0)) {
			formData = new FormData();
			selected.each(function () {
				formData.append('file[]', $(this).data('file_name'));
			});
			deleteFiles(formData);
		}
	});

	getImages(displayImages);
}(jQuery));
