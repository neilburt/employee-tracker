use employees_db;

INSERT INTO department
    (name)
VALUES
    ('Command'),
    ('Operations'),
    ('Sciences'),
    ('Civilian');

INSERT INTO role
    (title, salary, department_id)
VALUES
    ('Captain', 200000, 1),
    ('Commander', 170000, 1),
    ('Chief Engineer', 150000, 2),
    ('Engineer', 120000, 2),
    ('CMO', 160000, 3),
    ('Doctor', 125000, 3),
    ('Diplomat', 50000, 4),
    ('Bartender', 25000, 4);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Rick', 'Sanchez', 1, NULL),
    ('Dwight', 'Schrute', 2, 1),
    ('Bill', 'Hader', 3, NULL),
    ('Randy', 'Marsh', 4, 3),
    ('Laurana', 'Kanan', 5, NULL),
    ('Yamato', 'Oden', 6, 5),
    ('Samus', 'Aran', 7, NULL),
    ('Tommy', 'Bahama', 8, 7);