export const name = 'PermTest';
export const version = '0.0.1';
export const supported = '>=0.2.0-alpha.3';

import { commands } from 'server';

function permTest(executor, arg) {
	executor.send(executor.permissions.checkStrict(arg[0]) + '')
	executor.send(executor.permissions.check(arg[0]) + '')
}

commands.register('/perm', permTest, 'Check if executor has permission');
