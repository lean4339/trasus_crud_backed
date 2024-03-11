const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');
const fs = require('fs');
router.get('/create', function (req, res) {
	// Ruta al archivo JSON
	const rutaArchivo = 'data.json';
	const datos = [{ nombre: 'Leandro Ayala', id: faker.string.uuid(), email: faker.internet.email(), password: 123456, rol: 'admin' }]
	// Convierte el objeto a una cadena JSON
	for (let i = 0; i < 100000; i++) {
		const user = {
			nombre: faker.person.fullName(),
			id: faker.string.uuid(),
			email: faker.internet.email(),
			password: 123456,
			rol: 'user',
		}
		datos.push(user);
	}
	const jsonString = JSON.stringify(datos, null, 2); // null y 2 son parámetros opcionales para la indentación

	// Escribe la cadena JSON en un archivo
	fs.writeFile(rutaArchivo, jsonString, 'utf8', (err) => {
		if (err) {
			console.error('Error al escribir el archivo:', err);
			res.send({ err: true })
			return;
		}
		console.log('Archivo JSON creado correctamente.');
	});
})
router.get('/users', (req, res) => {
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {
			console.log(req.query)
			const page = parseInt(req.query.page) || 1; // Página predeterminada es 1
			const pageSize = parseInt(req.query.pageSize) || 10; // Tam
			const datos = JSON.parse(data);
			const paginatedData = paginate(datos, page, pageSize);
			const pageTwo = paginate(datos, page +1, pageSize);
			return res.send({
				page,
				pageSize,
				totalItems: datos.length,
				totalPages: Math.ceil(datos.length / pageSize),
				data: paginatedData,
			});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ error: true })
		}
	});
});
router.get('/users/:id', (req, res) => {
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {
			const page = parseInt(req.query.page) || 1; // Página predeterminada es 1
			const pageSize = parseInt(req.query.pageSize) || 5; // Tam
			const datos = JSON.parse(data);
			const user = findItemById(datos, req.params.id);
			return res.send({
				data: user,
			});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ error: true })
		}
	});
})
router.delete('/users/:id', (req, res) => {
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {
			const page = parseInt(req.query.page) || 1; // Página predeterminada es 1
			const pageSize = parseInt(req.query.pageSize) || 5; // Tam
			const datos = JSON.parse(data);
			const deleteResult = deleteItemById(datos, req.params.id);
			saveJSONToFile('data.json', datos);
			return res.send({
				data: deleteResult,
			});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ error: true })
		}
	});
})

router.put('/users/:id', (req, res) => {
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {
			const page = parseInt(req.query.page) || 1; // Página predeterminada es 1
			const pageSize = parseInt(req.query.pageSize) || 5; // Tam
			const datos = JSON.parse(data);
			const updateResult = updateItemById(datos, req.params.id, req.body);
			saveJSONToFile('data.json', datos);
			return res.send({
				data: updateResult,
			});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ error: true })
		}
	});
})
router.post('/users', (req, res) => {
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {
			const page = parseInt(req.query.page) || 1; // Página predeterminada es 1
			const pageSize = parseInt(req.query.pageSize) || 5; // Tam
			const datos = JSON.parse(data);
			addItem(datos, req.body);
			saveJSONToFile('data.json', datos);
			return res.send({
				data: req.body,
			});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ error: true })
		}
	});
})
router.post('/login', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.send({ error: true})
	}
	const rutaArchivo = 'data.json';
	fs.readFile(rutaArchivo, 'utf8', (err, data) => {
		if (err) {
			console.error('Error al leer el archivo:', err);
			return;
		}
		try {

			const datos = JSON.parse(data);
			const user = findItemByUsername(datos, email);
			if (!user) {
				throw new Error('not found');
			}
			const userData = JSON.stringify({ id: user.id, rol: user.rol });
			res.cookie('sesion', userData, { maxAge: 900000, httpOnly: true });
			res.send({status: 'ok'});
		} catch (error) {
			console.error('Error al parsear el archivo JSON:', error);
			res.send({ err: true })
		}
	});

})
// Función para paginar un arreglo de datos
function paginate(array, page, pageSize) {
	--page; // Página comienza en 1
	return array.slice(page * pageSize, (page + 1) * pageSize);
}
// Función para encontrar un elemento por su ID en un arreglo
function findItemById(array, id) {
	return array.find(item => item.id === id);
}
function findItemByUsername(array, id) {
	return array.find(item => item.email === id);
}
// Función para eliminar un elemento por su ID de un arreglo
function deleteItemById(array, id) {
	const index = array.findIndex(item => item.id === id);
	if (index !== -1) {
		array.splice(index, 1);
		return true; // Indica que el elemento fue eliminado
	}
	return false; // Indica que el elemento no fue encontrado
}

// Función para cambiar un elemento por su ID en un arreglo
function updateItemById(array, id, newData) {
	console.log(newData)
	const index = array.findIndex(item => item.id === id);
	if (index !== -1) {
		array[index] = { ...array[index], ...newData };
		return true; // Indica que el elemento fue actualizado
	}
	return false; // Indica que el elemento no fue encontrado
}

// Función para guardar el JSON modificado en un archivo
function saveJSONToFile(filename, jsonData) {
	fs.writeFileSync(filename, JSON.stringify(jsonData));
}


// Función para agregar un nuevo elemento al arreglo
function addItem(array, newItem) {
	newItem.id = faker.string.uuid();
	array.push(newItem);
}
module.exports = router;
