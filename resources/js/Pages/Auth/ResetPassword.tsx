import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ data, setData, processing, errors }) => {
                    const requirements = [
                        { regex: /.{8,}/, text: "Minimal 8 karakter" },
                        { regex: /[A-Z]/, text: "Huruf besar (A-Z)" },
                        { regex: /[0-9]/, text: "Angka (0-9)" },
                        { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "Karakter spesial (!@#$%...)" }
                    ];

                    return (
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    className="mt-1 block w-full bg-muted"
                                    readOnly
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full"
                                    autoFocus
                                    placeholder="New Password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />

                                {/* Password Requirements Visualization */}
                                <div className="rounded-lg bg-muted/50 p-4 mt-2 border border-border">
                                    <p className="text-sm font-medium mb-3 text-muted-foreground">Syarat Kata Sandi:</p>
                                    <ul className="space-y-1.5">
                                        {requirements.map((req, index) => {
                                            const isValid = req.regex.test(data.password || '');
                                            return (
                                                <li key={index} className="flex items-center text-xs transition-colors duration-200">
                                                    <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${isValid ? 'border-green-500 bg-green-500/10' : 'border-muted-foreground/30 bg-muted-foreground/10'}`}>
                                                        {isValid ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 text-green-500">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 text-muted-foreground/50">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={isValid ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                                        {req.text}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    className="mt-1 block w-full"
                                    placeholder="Confirm new password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={processing}
                                data-test="reset-password-button"
                            >
                                {processing && <Spinner />}
                                Reset password
                            </Button>
                        </div>
                    )
                }}
            </Form>
        </AuthLayout>
    );
}
