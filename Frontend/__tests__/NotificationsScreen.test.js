import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NotificationsScreen from '../src/components/Main/NotificationsScreen';
import notificationService from '../src/services/notificationService';
import { NotificationsProvider } from '../src/contexts/NotificationsContext';

jest.mock('../src/services/notificationService');

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('loads notifications and displays them', async () => {
    notificationService.getNotifications.mockResolvedValue({ data: [{ id: 1, mensagem_titulo: 'Hello', detalhes: 'Detalhe' }] });
    notificationService.getCount.mockResolvedValue({ data: { count: 1 } });

    const { getByText } = render(
      <NotificationsProvider>
        <NotificationsScreen />
      </NotificationsProvider>
    );

    await waitFor(() => getByText('Hello'));
    expect(getByText('Hello')).toBeTruthy();
  });

  test('mark as read triggers refresh', async () => {
    notificationService.getNotifications.mockResolvedValue({ data: [{ id: 2, mensagem_titulo: 'Bye', detalhes: '' }] });
    notificationService.getCount.mockResolvedValueOnce({ data: { count: 1 } });
    notificationService.markAsRead.mockResolvedValue({ success: true });
    notificationService.getCount.mockResolvedValueOnce({ data: { count: 0 } });

    const { getByText } = render(
      <NotificationsProvider>
        <NotificationsScreen />
      </NotificationsProvider>
    );

    await waitFor(() => getByText('Bye'));

    const markBtn = getByText('Marcar lida');
    fireEvent.press(markBtn);

    await waitFor(() => expect(notificationService.markAsRead).toHaveBeenCalledWith(2));
  });
});
