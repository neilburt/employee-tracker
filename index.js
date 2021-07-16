const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'S0l0ng!',
  database: 'employees_db',
});

const menu = () => {
  inquirer.prompt({
    name: 'menu',
    type: 'list',
    message: "What would you like to do?",
    choices: [
      "View Employees",
      "Add Employee",
      "View Roles",
      "Add Role",
      "View Departments",
      "Add Department",
      "Update Employee Role"]
  }).then(resp => {
    switch(resp.menu){
      case "View Employees":
        viewEmployees();
        break;
      case "Add Employee":
        addEmployee();
        break;
      case "View Roles":
        viewRoles();
        break;
      case "Add Role":
        addRole();
        break;
      case "View Departments":
        viewDepartments();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Update Employee Role":
        updateRole();
        break;
    };
  });
};

const viewEmployees = () => {
  connection.query('SELECT * FROM employee', (err, res) => {
    if(err) throw err;
    console.table(res);
    let interval = setInterval(() => {
      menu();
      clearInterval(interval);
    }, 2000);
  });
};

const addEmployee = () => {
  connection.query('SELECT * FROM role', (err, res) => {
    if(err) throw err;
    let roles = res.map((role) => {
      return {
        name: role.title,
        value: role.id
      };
    });
    
    connection.query('SELECT * FROM employee', (err, res) => {
      if(err) throw err;
      let managers = res.map((manager) => {
        return {
          name: `${manager.first_name} ${manager.last_name}`,
          value: manager.id
        };
      });

      inquirer.prompt([
        {
          name: 'first_name',
          type: 'input',
          message: "Enter the employee's first name."
        },
        {
          name: 'last_name',
          type: 'input',
          message: "Enter the employee's last name."
        },
        {
          name: 'role_id',
          type: 'list',
          message: "Select the role of the employee.",
          choices: roles
        },
        {
          name: 'manager_id',
          type: 'list',
          message: "Select the employee's manager.",
          choices: managers
        }
      ]).then(res => {
        console.log("add employee res", res);
        let query = connection.query('INSERT INTO employee SET ?', {
          first_name: res.first_name,
          last_name: res.last_name,
          role_id: res.role_id,
          manager_id: res.manager_id
        },
        function (err, res){
          if(err) throw err;
        });
        console.log("values", query.values);
        
        let interval = setInterval(() => {
          menu();
          clearInterval(interval);
        }, 2000);
      });
    });
  });
};

const viewRoles = () => {
  connection.query('SELECT * FROM role', (err, res) => {
    if(err) throw err;
    console.table(res);
    
    let interval = setInterval(() => {
      menu();
      clearInterval(interval);
    }, 2000);
  });
};

const addRole = () => {
  connection.query('SELECT * FROM department', (err, res) => {
    if(err) throw err;
    let departments = res.map((department) => {
      return {
        name: department.title,
        value: department.id
      };
    });
    inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: "Enter the title of the role."
      },
      {
        name: 'salary',
        type: 'input',
        message: "Enter the salary of the role."
      },
      {
        name: 'department_id',
        type: 'list',
        message: "Select the department the role will be in.",
        choices: departments
      }
    ]).then(res => {
      console.log("add role res", res);
      let query = connection.query('INSERT INTO role SET ?', {
        title: res.title,
        salary: res.salary,
        department_id: res.department_id
      },
        function(err, res){
          if(err) throw err;
        }
      );
      console.log("values", query.value);
      let interval = setInterval(() => {
        menu();
        clearInterval(interval);
      }, 2000);
    });
  });
};

const viewDepartments = () => {
  connection.query('SELECT * FROM department', (err, res) => {
    if(err) throw err;
    console.table(res);
    let interval = setInterval(() => {
      menu();
      clearInterval(interval);
    }, 2000);
  });
};

const addDepartment = () => {
  inquirer.prompt(
    {
      name: 'name',
      type: 'input',
      message: "Enter the name of the department."
    }
  ).then(res => {
    console.log("add department res", res);
    let query = connection.query('INSERT INTO department SET ?', {
      name: res.name
    },
      function(err, res){
        if(err) throw err;
      }
    );
    console.log("values", query.value);
    let interval = setInterval(() => {
      menu();
      clearInterval(interval);
    }, 2000);
  });
};

const updateRole = () => {
  connection.query('SELECT * FROM employee', (err, res) => {
    if(err) throw err;
    let employees = res.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      };
    });

    connection.query('SELECT * FROM role', (err, res) => {
      if(err) throw err;
      let roles = res.map((role) => {
        return {
          name: role.title,
          value: role.id
        };
      });
      
      inquirer.prompt([
        {
          name: 'employee',
          type: 'list',
          message: "Select the employee whose role you would like to update.",
          choices: employees
        },
        {
            name: 'role',
            type: 'list',
            message: "Select the new role for the employee.",
            choices: roles
        }
      ]).then((res) => {
        connection.query('UPDATE employee SET ? WHERE ?', [
          {
            role_id: res.role
          },
          {
            id: res.employee
          }
        ],
        function(err) {
          if(err) throw err;
        });
        console.log("Employee role updated successfully.");
        let interval = setInterval(() => {
          menu();
          clearInterval(interval);
        }, 2000);
      });
    });
  });
};

connection.connect((err) => {
  if(err) throw err;
  menu();
});