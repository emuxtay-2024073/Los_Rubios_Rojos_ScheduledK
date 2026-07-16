import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleHomePath, getRoleLabel } from './roleViews.js';

test('devuelve la ruta de administrador para roles administrativos', () => {
  assert.equal(getRoleHomePath('ADMIN'), '/dashboard');
  assert.equal(getRoleHomePath('SUPER_ADMIN'), '/dashboard');
  assert.equal(getRoleHomePath('ADMIN_ROLE'), '/dashboard');
});

test('devuelve la ruta de coordinador para perfiles coordinador', () => {
  assert.equal(getRoleHomePath('COORDINADOR'), '/coordinador');
});

test('devuelve la ruta de padre para perfiles padre', () => {
  assert.equal(getRoleHomePath('PADRE'), '/padre');
});

test('asigna etiquetas legibles para cada rol', () => {
  assert.equal(getRoleLabel('PADRE'), 'Padre de familia');
  assert.equal(getRoleLabel('COORDINADOR'), 'Coordinador');
  assert.equal(getRoleLabel('SUPER_ADMIN'), 'Administrador');
});
