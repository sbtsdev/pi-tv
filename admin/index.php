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
			<div class="space-age" id="holder">
				<div class="instruct"><p>Drag images here to upload</p></div>
				<div class="upload-response"></div>
			</div>
			<div class="meter orange" id="uploadprogress"><span style="width:0%;"></span></div>
			<p class="fallbacks"><label>Drag &amp; drop not supported, but you can still upload via this input field:<input name="file[]" type="file" multiple="multiple" /></label></p>
		</div>
		<div class="instruct"><p>Currently uploaded files</p></div>
		<div class="file-list"></div>
	</div>
	<script src="../js/jquery-1.8.1.min.js"></script>
	<script src="js/admin.js"></script>
</body>
</html>
