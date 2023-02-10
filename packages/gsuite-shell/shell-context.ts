import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

enum MessageType {
  HOST_RUN = 'HOST_RUN',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export type ShellContextOptions = {
  run: (methodName: string, ...args) => Promise<any>;
};

export const defaultShellContextOptions = {
  run: (methodName: string, ...args) => {
    return new Promise((res, rej) => {
      const c = new MessageChannel();
      c.port1.onmessage = ({ data: response }) => {
        c.port1.close();
        if (response.type === MessageType.SUCCESS) {
          res(response.arg);
        } else {
          rej(response.arg);
        }
      };

      window.parent.postMessage(
        {
          type: MessageType.HOST_RUN,
          methodName,
          args,
        },
        '*',
        [c.port2]
      );
    });
  },
};

export const ShellContext = createContext<ShellContextOptions>(
  defaultShellContextOptions
);

export const useShellContext = () => useContext(ShellContext);
