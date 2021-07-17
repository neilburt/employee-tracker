const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'S0l0ng!',
  database: 'employees_db',
});

// all initial menu options and their respective functions
const menu = () => {
  inquirer.prompt({
    name: 'menu',
    type: 'list',
    message: "What would you like to do?",
    choices: [
      "View Employees",
      "View Roles",
      "View Departments",
      "View Employees by Manager",
      "View Department Budget",
      "Update Employee Role",
      "Update Employee Manager",
      "Add Employee",
      "Add Role",
      "Add Department",
      "Remove Employee",
      "Remove Role",
      "Remove Department"]
  }).then(resp => {
    switch(resp.menu){
      case "View Employees":
        viewEmployees();
        break;
      case "View Roles":
        viewRoles();
        break;
      case "View Departments":
        viewDepartments();
        break;
      case "View Employees by Manager":
        viewByManager();
        break;
      case "View Department Budget":
        viewDepartmentBudget();
        break;    
      case "Update Employee Role":
        updateRole();
        break;
      case "Update Employee Manager":
        updateManager();
        break;  
      case "Add Employee":
        addEmployee();
        break;
      case "Add Role":
        addRole();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Remove Employee":
        deleteEmployee();
        break;
      case "Remove Role":
        deleteRole();
        break;
      case "Remove Department":
        deleteDepartment();
        break;
    };
  });
};

// all employee information - the most comprehensive view function
const viewEmployees = () => {
  connection.query(`SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee
  LEFT JOIN employee manager ON manager.id = employee.manager_id
  JOIN role ON(role.id = employee.role_id)
  JOIN department ON(department.id = role.department_id)
  ORDER BY role.id`, (err, res) => {
    if(err) throw err;
    console.table(res);
    timedReturn();
  });
};

// all roles and the departments they're in
const viewRoles = () => {
  connection.query(`SELECT role.id, role.title AS role,
  department.name AS department FROM role
  LEFT JOIN department ON role.department_id = department.id
  ORDER BY department.id`, (err, res) => {
    if(err) throw err;
    console.table(res);
    timedReturn();
  });
};

// all the departments
const viewDepartments = () => {
  connection.query('SELECT * FROM department', (err, res) => {
    if(err) throw err;
    console.table(res);
    timedReturn();
  });
};

// all employees displayed by manager - includes those without managers (null)
const viewByManager = () => {
  connection.query(`SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, CONCAT(employee.first_name, ' ', employee.last_name) AS employee FROM employee
  LEFT JOIN employee manager ON manager.id = employee.manager_id
  ORDER BY manager DESC`, (err, res) => {
    if(err) throw err;
    console.table(res);
    timedReturn();
  });
};

// all departments and their total salary budgets
const viewDepartmentBudget = () => {
  connection.query(`SELECT department.name AS department, SUM(role.salary) AS budget FROM employee
  JOIN role ON(role.id = employee.role_id)
  JOIN department ON(department.id = role.department_id)
  GROUP BY department.name`, (err, res) => {
    if(err) throw err;
    console.table(res);
    timedReturn();
  });
};

// change the role of an employee
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
          console.log("Employee role updated successfully.");
          timedReturn();
        });
      });
    });
  });
};

// change the manager of an employee
const updateManager = () => {
  connection.query('SELECT * FROM employee', (err, res) => {
    if(err) throw err;
    let employees = res.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      };
    });
    
    let managers = res.map((manager) => {
      return {
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
      };
    });
    
    inquirer.prompt([
      {
        name: 'employee',
        type: 'list',
        message: "Select the employee whose manager you would like to update.",
        choices: employees
      },
      {
        name: 'manager',
        type: 'list',
        message: "Select the new manager for the employee.",
        choices: managers
      }
      ]).then((res) => {
        connection.query('UPDATE employee SET ? WHERE ?', [
          {
            manager_id: res.manager
          },
          {
            id: res.employee
          }
        ],
        function(err) {
          if(err) throw err;
          console.log("Employee manager updated successfully.");
          timedReturn();
        });
      });
  });
};

// create new employee
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
        connection.query('INSERT INTO employee SET ?', {
          first_name: res.first_name,
          last_name: res.last_name,
          role_id: res.role_id,
          manager_id: res.manager_id
        },
        function (err, res){
          if(err) throw err;
          console.log("Employee successfully added.");
          timedReturn();
        });
      });
    });
  });
};

// create new role
const addRole = () => {
  connection.query('SELECT * FROM department', (err, res) => {
    if(err) throw err;
    let departments = res.map((department) => {
      return {
        name: department.name,
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
      connection.query('INSERT INTO role SET ?', {
        title: res.title,
        salary: res.salary,
        department_id: res.department_id
      },
      function(err, res){
        if(err) throw err;
        console.log("Role successfully added.");
        timedReturn();
      });
    });
  });
};

// create new department
const addDepartment = () => {
  inquirer.prompt(
    {
      name: 'name',
      type: 'input',
      message: "Enter the name of the department."
    }
  ).then(res => {
    connection.query('INSERT INTO department SET ?', {
      name: res.name
    },
    function(err, res){
      if(err) throw err;
      console.log("Department added successfully.");
      timedReturn();
    });
  });
};

// remove employee
const deleteEmployee = () => {
  connection.query('SELECT * FROM employee', (err, res) => {
    if(err) throw err;
    let employees = res.map((employee) => {
      return {
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      };
    });
    inquirer.prompt([
      {
        name: 'employee',
        type: 'list',
        message: "Select the employee that will be removed.",
        choices: employees
      }
    ]).then((res) => {
      connection.query('DELETE FROM employee WHERE ?', 
        {
          id: res.employee
        },
      function(err) {
        if(err) throw err;
        console.log("Employee removed successfully.");
        timedReturn();
      });
    });
  });
}

// remove role - this also removes any employees with selected role assigned
const deleteRole = () => {
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
        name: 'role',
        type: 'list',
        message: "Select the role that will be removed.",
        choices: roles
      }
    ]).then((res) => {
      connection.query('DELETE FROM role WHERE ?', 
        {
          id: res.role
        },
      function(err) {
        if(err) throw err;
        console.log("Role removed successfully.");
        timedReturn();
      });
    });
  });
};

// remove department - this also removes all employees currently assigned to selected department
const deleteDepartment = () => {
  connection.query('SELECT * FROM department', (err, res) => {
    if(err) throw err;
    let departments = res.map((department) => {
      return {
        name: department.name,
        value: department.id
      };
    });
    inquirer.prompt([
      {
        name: 'department',
        type: 'list',
        message: "Select the department that will be removed.",
        choices: departments
      }
    ]).then((res) => {
      connection.query('DELETE FROM department WHERE ?', 
        {
          id: res.department
        },
      function(err) {
        if(err) throw err;
        console.log("Department removed successfully.");
        timedReturn();
      });
    });
  });
};

// returns the main menu after a selection is made
const timedReturn = () => {
  let interval = setInterval(() => {
    menu();
    clearInterval(interval);
  }, 2000);
};

connection.connect((err) => {
  if(err) throw err;
  menu();
});