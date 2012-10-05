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
			<div class="space-age" id="holder"></div>
			<p class="space-age">Upload progress: <progress id="uploadprogress" min="0" max="100" value="0">0</progress></p>
			<p class="space-age">Drag an image from your desktop on to the area above to upload automatically.</p>
			<p class="fallbacks"><label>Drag &amp; drop not supported, but you can still upload via this input field:<input name="file[]" type="file" multiple="multiple" /></label></p>
			<p class="upload-response"></p>
		</div>
		<div class="file-list"></div>
	</div>
	<script src="../js/jquery-1.8.1.min.js"></script>
	<script src="js/admin.js"></script>
</body>
</html>
