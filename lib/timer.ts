/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
export class Timer {
  public timeout: number;
  public callback: () => void;
  public handle: ReturnType<typeof setTimeout>;

  constructor(timeout: number, callback: () => void) {
    this.timeout = timeout;
    this.callback = callback;
    this.handle = setTimeout(() => {
      callback();
    }, this.timeout);
  }
  async cancel() {
    clearTimeout(this.handle);
  }
}

export class SystemMessageTimer extends Timer {
  public messageId: number;

  constructor(timeout: number, callback: () => void, messageId: number) {
    super(timeout, callback);
    this.messageId = messageId;
  }
}
