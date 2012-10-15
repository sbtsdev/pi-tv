<!DOCTYPE HTML>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Bevin Center Admin</title>
	<link rel="stylesheet" href="css/style.css" />
</head>
<body>
	<div class="wrapper">
		<div class="file-upload">
			<div class="instruct"><p>Drag images here to upload</p></div>
			<div class="space-age" id="holder">
				<div class="upload-response"></div>
			</div>
			<div class="meter orange" id="uploadprogress"><span style="width:0%;"></span></div>
			<p class="fallbacks"><label>Drag &amp; drop not supported, but you can still upload via this input field:<input name="file[]" type="file" multiple="multiple" /></label></p>
		</div>
		<div class="file-management">
			<div class="instruct"><p>Currently uploaded files</p></div>
			<div class="img-manage-all">
				<button class="select-all">Select All</button>
				<button class="delete-selected">Delete Selected</button>
			</div>
			<div class="file-list"></div>
		</div>
	</div>
	<script id="img_up_tmpl" type="text/x-handlebars-template">
		<div class="img-up">
			<div class="img-controls">
				<input class="img-file" name="img_file_name" type="checkbox" data-file_name="{{file_name}}" />
				<button class="delete-button" data-file_name="{{file_name}}">Delete</button>
			</div>
			<img class="file-list-img" src="{{img_src}}" alt="{{img_alt}}" width="300px" />
			<label class="file-name-label" for="img_file_name">{{file_name}}</label>
		</div>
	</script>
	<script src="../js/jquery-1.8.1.min.js"></script>
	<script src="../js/handlebars.js"></script>
	<script src="js/admin.js"></script>
</body>
</html>
