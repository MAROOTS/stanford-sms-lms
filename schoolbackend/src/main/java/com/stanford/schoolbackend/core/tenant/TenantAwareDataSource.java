package com.stanford.schoolbackend.core.tenant;

import org.springframework.jdbc.datasource.ConnectionProxy;
import org.springframework.jdbc.datasource.DelegatingDataSource;

import javax.sql.DataSource;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class TenantAwareDataSource extends DelegatingDataSource {

    private final TenantContext tenantContext;

    public TenantAwareDataSource(DataSource targetDataSource, TenantContext tenantContext) {
        super(targetDataSource);
        this.tenantContext = tenantContext;
    }

    @Override
    public Connection getConnection() throws SQLException {
        return prepare(super.getConnection());
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return prepare(super.getConnection(username, password));
    }

    private Connection prepare(Connection connection) throws SQLException {
        apply(connection, tenantContext.getCurrentSchool());
        return wrap(connection);
    }

    static void apply(Connection connection, Long schoolId) throws SQLException {
        String value = schoolId != null ? schoolId.toString() : "-1";
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT set_config('app.current_school_id', ?, false)")) {
            statement.setString(1, value);
            statement.execute();
        }
    }

    private static Connection wrap(Connection connection) {
        return (Connection) Proxy.newProxyInstance(
                ConnectionProxy.class.getClassLoader(),
                new Class<?>[]{ConnectionProxy.class},
                new TenantConnectionHandler(connection));
    }

    private static final class TenantConnectionHandler implements InvocationHandler {
        private final Connection delegate;

        private TenantConnectionHandler(Connection delegate) {
            this.delegate = delegate;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String name = method.getName();
            if ("getTargetConnection".equals(name)) return delegate;
            if ("equals".equals(name)) return proxy == args[0];
            if ("hashCode".equals(name)) return System.identityHashCode(proxy);
            if ("unwrap".equals(name)) {
                Class<?> iface = (Class<?>) args[0];
                if (iface.isInstance(proxy)) return proxy;
                return delegate.unwrap(iface);
            }
            if ("isWrapperFor".equals(name)) {
                Class<?> iface = (Class<?>) args[0];
                return iface.isInstance(proxy) || delegate.isWrapperFor(iface);
            }
            if ("close".equals(name)) {
                try {
                    apply(delegate, null);
                } finally {
                    delegate.close();
                }
                return null;
            }
            try {
                return method.invoke(delegate, args);
            } catch (InvocationTargetException ex) {
                throw ex.getCause();
            }
        }
    }
}