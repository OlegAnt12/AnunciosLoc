import React from 'react';
import { render, act } from '@testing-library/react-native';
import { NotificationsProvider, useNotifications } from '../src/contexts/NotificationsContext';
import notificationService from '../src/services/notificationService';

jest.mock('../src/services/notificationService');

const TestConsumer = () => {
  const { count, loading, refreshCount } = useNotifications();
  return (
    <>
      <>{String(count)}</>
      <>{String(loading)}</>
      <button onClick={() => refreshCount()} testID="refresh">refresh</button>
    </>
  );
};

describe('NotificationsContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('initializes and refreshes count', async () => {
    notificationService.getCount.mockResolvedValue({ data: { count: 7 } });

    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <NotificationsProvider>
          <TestConsumer />
        </NotificationsProvider>
      ));
    });

    expect(getByText('7')).toBeTruthy();

    notificationService.getCount.mockResolvedValue({ data: { count: 3 } });

    await act(async () => {
      // call refreshCount
      const btn = getByText('refresh');
      btn.props.onClick();
    });

    expect(getByText('3')).toBeTruthy();
  });
});
