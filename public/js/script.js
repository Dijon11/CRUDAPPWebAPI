const userContainer = document.getElementById("users-container");

const fetchUsers = async ()=>{
    try {
        //fetch data from the server
        const response = await fetch("/peopleData");
        if(!response.ok)
        {
            throw new Error("failed to get users");


        }
        //parse json
        const users = await response.json();

        //format the data to html

        userContainer.innerHTML = "";

        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "user";
            userDiv.innerHTML = `${user.firstname} ${user.lastname} Email: ${user.email}`;
            userContainer.appendChild(userDiv);
        });



    } catch (error) {
        console.error("Error: ", error);
        userContainer.innerHTML = "<p style='color:red'> Failed to get users </p>";
    }
}

fetchUsers();
