<?php
global $relative_upload_directory;
$relative_upload_directory = 'uploads/';

function do_web_action($action)
{
    $from_web = (isset($_REQUEST['from']) && $_REQUEST['from'] === 'web');
    $return_json = array(
                    'success' => false,
                    'message' => 'Invalid action',
                    'reset' => false, 'reload' => false );

    if ($action === 'get_files') {
        $return_json['files'] = get_files_array($from_web);
        if (count($return_json['files']) > 0) {
            $return_json['success'] = true;
            $return_json['message'] = 'Retrieved ' .
                count($return_json['files']) . ' files.';
        } else {
            $return_json['message'] = 'No files found.';
        }
    } elseif ($action === 'get_next') {
        // just check if it's set, could be zero length for first image
        if (isset($_REQUEST['current'])) {
            $current = $_REQUEST['current'];
            $return_json['current'] = $current;
            $return_json['next'] = get_next($_REQUEST['current'], $from_web);
            if (strlen($return_json['next']) > 0) {
                $return_json['success'] = true;
                $return_json['message'] = 'Retrieved next file.';
            } else {
                $return_json['message'] = 'No next file found.';
            }
        } else {
            $return_json['message'] = 'No current file supplied.';
        }
    } elseif ($action === 'upload_files') {
        $files = upload_files($from_web);
        $file_total = is_array($_FILES['file']['name']) ?
                        count($_FILES['file']['name']) : 1;
        $return_json['success'] = $file_total === count($files['files']);
        if (count($files['files']) > 0) {
            if ($return_json['success']) {
                $number_lang = (count($files['files']) > 1) ? 'All files ' : 'File ';
                $return_json['message'] = $number_lang . 'uploaded successfully.';
            } else {
                $return_json['message'] = 'Only some files uploaded successfully.';
            }
            $return_json['files'] = $files['files'];
            $return_json['failed'] = $files['failed'];
        } else {
            $return_json['message'] = 'Unable to upload.';
            $return_json['failed'] = $files['failed'];
        }
    } elseif ($action === 'delete_files') {
        $files = delete_files($from_web);
        $file_total = is_array($_REQUEST['file']) ? count($_REQUEST['file']) : 1;
        $return_json['success'] = $file_total === count($files['files']);
        if (count($files['files']) > 0) {
            if ($return_json['success']) {
                $number_lang = (count($files['files']) > 1) ? 'All files ' : 'File ';
                $return_json['message'] = $number_lang . 'deleted successfully.';
            } else {
                $return_json['message'] = 'Only some files deleted successfully.';
            }
            $return_json['files'] = $files['files'];
            $return_json['failed'] = $files['failed'];
        } else {
            $return_json['message'] = 'Unable to upload.';
        }
    }

    return json_encode($return_json);
}

/* $from_web is true if the calling function is in the root of the web folder,
 * so it strips the ../ from the folder */
function get_files_array($from_web = false)
{
    global $relative_upload_directory;
    $directory = '../' . $relative_upload_directory;
    $files_raw = glob($directory . '*');
    $files_json = array();
    foreach ($files_raw as $index => $image_path) {
        if (is_valid_file_extension($image_path)) {
            $files_json[] = ($from_web) ?
                                str_replace('../', '', $image_path) :
                                $image_path;
        }
    }
    return $files_json;
}

function get_next($current, $from_web = false)
{
    $all_files = get_files_array($from_web);
    $total = count($all_files);
    if ($total > 0) {
        if (strlen($current) === 0) {
            return $all_files[0];
        }
        for ($n = 0; $n < $total; $n += 1) {
            if ($all_files[$n] === $current) {
                return ($n + 1 === $total) ?
                    $all_files[0] :
                    $all_files[$n + 1];
            }
        }
        // it is possible that the current file was deleted and therefore
        //  its name is not found in the loop above so the next file is
        //  never retrieved. Instead, try without a current file
        return get_next('', $from_web);
    }
    return '';
}

function upload_files($from_web)
{
    global $relative_upload_directory;
    $upload_directory = dirname(dirname(__FILE__)) . '/' . $relative_upload_directory;
    $files = array( 'files' => array(), 'failed' => array() );
    foreach ($_FILES['file']['name'] as $index => $fname) {
        if (is_valid_file_extension($fname)
            && in_array(
                $_FILES['file']['type'][$index],
                array( 'image/png', 'image/jpeg', 'image/gif' )
            )
            && is_valid_size($_FILES['file'], $index)
        ) {
            if (move_uploaded_file(
                $_FILES['file']['tmp_name'][$index],
                $upload_directory . $fname
            )
            ) {
                chmod($upload_directory . $fname, 0770);
                $files['files'][] = ($from_web ? '' : '../') .
                    $relative_upload_directory . $fname;
            } else {
                $files['failed'][] = array( 'file' => $fname, 'reason' => 'Server could not upload file' );
            }
        } else {
            $files['failed'][] = array( 'file' => $fname );
            $latest = count($files['failed']) - 1;
            if (! is_valid_file_extension($fname)) {
                $files['failed'][$latest]['reason'] = 'Invalid file extension';
            } elseif (! in_array(
                $_FILES['file']['type'][$index],
                array( 'image/png', 'image/jpeg', 'image/gif' )
            )
            ) {
                $files['failed'][$latest]['reason'] = 'Invalid file type';
            } elseif (! is_valid_size($_FILES['file'], $index)) {
                $files['failed'][$latest]['reason'] = 'File size too large (max: 8MB)';
            }
        }
    }
    return $files;
}

function is_valid_size($file, $index)
{
    return is_array($file['size'])
        && (count($file['size']) > $index)
        && $file['size'][$index] <= (8 * 1024 * 1024); // 8 MB in bytes
}
function is_valid_file_extension($file_name)
{
    return in_array(
        strtolower(substr(strrchr($file_name, "."), 1)),
        array( 'jpg', 'jpeg', 'png', 'gif' )
    );
}

function delete_files($from_web)
{
    global $relative_upload_directory;
    $upload_directory = dirname(dirname(__FILE__)) . '/' . $relative_upload_directory;
    $files = array( 'files' => array(), 'failed' => array() );
    foreach ($_REQUEST['file'] as $index => $fname) {
        if (is_valid_file_extension($fname)) {
            if (unlink($upload_directory . $fname)) {
                $files['files'][] = ($from_web ? '' : '../') .
                    $relative_upload_directory . $fname;
            } else {
                $files['failed'][] = $fname;
            }
        } else {
            $files['failed'][] = $fname;
        }
    }
    return $files;
}

if (isset($_REQUEST['action'])) {
    echo do_web_action(strtolower($_REQUEST['action']));
}
