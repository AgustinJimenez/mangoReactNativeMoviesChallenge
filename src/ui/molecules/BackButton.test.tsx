import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { renderWithProviders } from '@/testUtils';
import { BackButton } from '@/ui/molecules/BackButton';

const Stack = createNativeStackNavigator();

// BackButton calls useNavigation(), which needs a real Screen/Navigator
// context to resolve — same reasoning as MoviesListScreen.test.tsx.
const renderBackButton = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={BackButton} />
      </Stack.Navigator>
    </NavigationContainer>,
  );

describe('BackButton', () => {
  it('renders with an accessible "Go back" label', () => {
    const { getByLabelText } = renderBackButton();

    expect(getByLabelText('Go back')).toBeTruthy();
  });
});
