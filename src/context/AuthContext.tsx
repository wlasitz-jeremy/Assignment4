import { Session, User } from "@supabase/supabase-js";
import { 
    createContext, 
    PropsWithChildren, 
    useContext, 
    useEffect, 
    useMemo, 
    useState 
} from "react";
import { supabase } from "../lib/supabase";

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    LogIn: (email: string, password: string) => Promise<void>;
    SignUp: (email: string, password: string) => Promise<void>;
    SignOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        supabase.auth.getSession().then(({ data, error }) => {
            if (isMounted) return;
            if (error) console.warn("Session restore failed: ", error.message);
            setSession(data.session ?? null);
            setIsLoading(false);
        });
        const {data: { subscription }, } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setIsLoading(false);        
        });
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const LogIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password, 
        });
        if(error) throw error;
    };

    const SignUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ 
            email: email.trim(), 
            password, 
        });
        if(error) throw error;
    };

    const SignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
    };

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        isLoading,
        LogIn,
        SignUp,
        SignOut,
    }), [session, isLoading]);

    return<AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}