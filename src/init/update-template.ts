import path from 'path';
import { execDaemon } from '../execDaemon';
import core from '../utils/core';
const { fse: fs, getRootHome } = core;
const cachePath = path.join(getRootHome(), 'cache');
const templatePath = path.join(cachePath, 'alibaba-template');
const TTL = 24 * 60 * 60 * 1000;

export function updateTemplate() {
  const lockPath = path.join(templatePath, 'update.lock');
  const now = Date.now();
  let canUpdate: boolean;
  if (!fs.existsSync(lockPath)) {
    fs.ensureFileSync(lockPath);
    fs.writeFileSync(lockPath, JSON.stringify({ currentTimestamp: now }, null, 2));
    canUpdate = true;
  } else {
    let data: any = fs.readFileSync(lockPath, 'utf8');
    data = JSON.parse(data);
    canUpdate = now - data.currentTimestamp > TTL;
  }
  if (canUpdate) {
    execDaemon('template.js');
  }
}
