<?php
        $host="localhost";
        $username="root";
	$password="root";
	$db_name="ccatdb";
	$tbl_name="user";

	$conn=mysql_connect("$host","$username","$password")or die("cannot connect");

	mysql_select_db("$db_name")or die("cannot select db");
	
	$name = $_POST['name'];
	$mobno = $_POST['mobno'];

	$sql = "INSERT INTO user(name,mobileno) 
  	VALUES('$name', '$mobno')";

	 if (mysqli_query($conn, $sql)) {
		echo "New record created successfully !";
	 }
	
	 else {
		echo "Error: ";
	 }
	 mysqli_close($conn);

?>

