<!DOCTYPE html>
<html>
<head>
	<title>Home</title>
</head>
<body>
	<?php
	session_start();
	require("Connexion/Connexion_db.php");
	$session_id = $_GET['id'];

	if($_SESSION["loggedUser"] != true){
		header("Location: Login.php");
	}
	?>

	<a href="Logout.php">Logout</a>

	<?php
	$sql_select = "SELECT * FROM docs WHERE user_id='$session_id'";
	$docs=$connexion->query($sql_select);

	if($docs->rowCount()>0)
	{
		while($row = $docs->fetch(PDO::FETCH_ASSOC)){
			$filename = $row["nom"];
			$upload_date = $row["upload_date"];
			$size = $row["size"];
			$file_type = $row["file_type"];
			
			
     
			echo "<table>
    <thead>
        <tr>
            <th colspan='2'>$filename</th>
        </tr>
    </thead>
    <tbody>
        <tr>
         <object data='uploads/$filename' width='300' height='200'></object> 
        	<a href='uploads/$filename' target='_blank'>$filename</a>
            <td>$upload_date</td>
            <td>$size</td>
            <td>$file_type</td>
        </tr>
    </tbody>
    </table>
    </br>
    <a href='Paste.php?id=$session_id&file=$filename'>Copy and Paste</a>
    	";
		}
	}
	?>

	<a href="Upload_page.php?id=<?php echo $session_id?>">Upload</a>
</body>
</html>
